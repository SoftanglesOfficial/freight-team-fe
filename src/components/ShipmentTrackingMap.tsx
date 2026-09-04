"use client";

import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader, OverlayView, InfoWindow } from "@react-google-maps/api";
import { Box, Text, Alert, Stack, Divider, Group as MantineGroup, ScrollArea, Paper } from "@mantine/core";
import { IconAlertCircle, IconMapPin, IconClock, IconNotes } from "@tabler/icons-react";
import dayjs from "dayjs";

interface Location {
  latitude: number;
  longitude: number;
}

export interface MapLocationNote {
  latitude?: number;
  longitude?: number;
  note?: string;
  timestamp?: string | Date;
}

interface ShipmentTrackingMapProps {
  origin: Location;
  destination: Location;
  currentLocation?: Location;
  onLocationUpdate?: (lat: number, lng: number) => void;
  height?: string;
  originAddress?: string;
  destinationAddress?: string;
  lastNote?: string;
  lastUpdate?: string | Date;
  hideCoordinates?: boolean;
  /** Location / note updates from status history — click a pin to see its note */
  locationNotes?: MapLocationNote[];
}

const libraries: ("drawing" | "geometry" | "places" | "visualization")[] = ["places"];

// Helper to check if coordinates are invalid (0,0 or null/undefined)
const isValidCoordinate = (loc: Location | undefined): boolean => {
  if (!loc) return false;
  const { latitude, longitude } = loc;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  // Check if coordinates are (0,0) which is in the ocean
  if (latitude === 0 && longitude === 0) return false;
  return true;
};

const ShipmentTrackingMap: React.FC<ShipmentTrackingMapProps> = ({
  origin,
  destination,
  currentLocation,
  onLocationUpdate,
  height = "500px",
  originAddress,
  destinationAddress,
  lastNote,
  lastUpdate,
  hideCoordinates = false,
  locationNotes = [],
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [activeNote, setActiveNote] = useState<MapLocationNote | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey || "",
    libraries,
  });

  // State for geocoded coordinates
  const [geocodedOrigin, setGeocodedOrigin] = useState<Location | null>(null);
  const [geocodedDestination, setGeocodedDestination] = useState<Location | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  // Geocode addresses if coordinates are invalid
  useEffect(() => {
    if (!isLoaded || !apiKey) return;

    const geocodeAddress = async (address: string): Promise<Location | null> => {
      return new Promise((resolve) => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              latitude: location.lat(),
              longitude: location.lng(),
            });
          } else {
            console.warn(`Geocoding failed for address: ${address}`, status);
            resolve(null);
          }
        });
      });
    };

    const performGeocoding = async () => {
      const needsOriginGeocoding = !isValidCoordinate(origin) && originAddress;
      const needsDestinationGeocoding = !isValidCoordinate(destination) && destinationAddress;

      if (!needsOriginGeocoding && !needsDestinationGeocoding) {
        return;
      }

      setIsGeocoding(true);
      setGeocodingError(null);

      try {
        if (needsOriginGeocoding) {
          const geocoded = await geocodeAddress(originAddress!);
          setGeocodedOrigin(geocoded);
        }
        if (needsDestinationGeocoding) {
          const geocoded = await geocodeAddress(destinationAddress!);
          setGeocodedDestination(geocoded);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        setGeocodingError("Failed to geocode addresses. Please check the address format.");
      } finally {
        setIsGeocoding(false);
      }
    };

    performGeocoding();
  }, [isLoaded, apiKey, origin, destination, originAddress, destinationAddress]);

  // Use geocoded coordinates if original coordinates are invalid
  const effectiveOrigin = useMemo(() => {
    if (isValidCoordinate(origin)) return origin;
    if (geocodedOrigin) return geocodedOrigin;
    return origin; // Fallback to original even if invalid
  }, [origin, geocodedOrigin]);

  const effectiveDestination = useMemo(() => {
    if (isValidCoordinate(destination)) return destination;
    if (geocodedDestination) return geocodedDestination;
    return destination; // Fallback to original even if invalid
  }, [destination, geocodedDestination]);

  const currentNote = useMemo((): MapLocationNote | null => {
    if (!currentLocation) return null;
    const match = [...locationNotes]
      .reverse()
      .find(
        (n) =>
          n.latitude != null &&
          n.longitude != null &&
          Math.abs(n.latitude - currentLocation.latitude) < 0.0001 &&
          Math.abs(n.longitude - currentLocation.longitude) < 0.0001,
      );
    if (match) return match;
    const withNote = [...locationNotes].reverse().find((n) => n.note);
    if (withNote) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        note: withNote.note,
        timestamp: withNote.timestamp || lastUpdate,
      };
    }
    return {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      note: lastNote,
      timestamp: lastUpdate,
    };
  }, [currentLocation, locationNotes, lastNote, lastUpdate]);

  const geoNotes = useMemo(
    () =>
      locationNotes.filter(
        (n) =>
          n.latitude != null &&
          n.longitude != null &&
          Number.isFinite(n.latitude) &&
          Number.isFinite(n.longitude) &&
          !(n.latitude === 0 && n.longitude === 0),
      ),
    [locationNotes],
  );

  const historyPins = useMemo(() => {
    if (!currentLocation) return geoNotes;
    return geoNotes.filter(
      (n) =>
        !(
          Math.abs((n.latitude as number) - currentLocation.latitude) < 0.0001 &&
          Math.abs((n.longitude as number) - currentLocation.longitude) < 0.0001
        ),
    );
  }, [geoNotes, currentLocation]);

  const notesHistory = useMemo(() => {
    return [...locationNotes]
      .filter((n) => !!n.note)
      .sort((a, b) => {
        const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return tb - ta;
      });
  }, [locationNotes]);

  const openNote = useCallback((note: MapLocationNote) => {
    if (note.latitude == null || note.longitude == null) return;
    setActiveNote((prev) =>
      prev &&
      prev.latitude != null &&
      prev.longitude != null &&
      Math.abs(prev.latitude - note.latitude!) < 0.0001 &&
      Math.abs(prev.longitude - note.longitude!) < 0.0001
        ? null
        : note,
    );
  }, []);

  // Calculate center and bounds - only use valid coordinates
  const bounds = useMemo(() => {
    const allPoints: Array<{ lat: number; lng: number }> = [];
    
    if (isValidCoordinate(effectiveOrigin)) {
      allPoints.push({ lat: effectiveOrigin.latitude, lng: effectiveOrigin.longitude });
    }
    if (isValidCoordinate(effectiveDestination)) {
      allPoints.push({ lat: effectiveDestination.latitude, lng: effectiveDestination.longitude });
    }
    if (currentLocation && isValidCoordinate(currentLocation)) {
      allPoints.push({ lat: currentLocation.latitude, lng: currentLocation.longitude });
    }
    for (const n of geoNotes) {
      allPoints.push({ lat: n.latitude!, lng: n.longitude! });
    }

    // If no valid points, return default bounds
    if (allPoints.length === 0) {
      return {
        north: 40.7128,
        south: 40.7128,
        east: -74.0060,
        west: -74.0060,
      };
    }

    const lats = allPoints.map((p) => p.lat);
    const lngs = allPoints.map((p) => p.lng);

    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    };
  }, [effectiveOrigin, effectiveDestination, currentLocation, geoNotes]);

  const center = useMemo(() => {
    // Only calculate center if we have valid bounds
    const hasValidOrigin = isValidCoordinate(effectiveOrigin);
    const hasValidDestination = isValidCoordinate(effectiveDestination);
    
    if (hasValidOrigin && hasValidDestination) {
      return {
        lat: (bounds.north + bounds.south) / 2,
        lng: (bounds.east + bounds.west) / 2,
      };
    }
    if (hasValidOrigin) {
      return { lat: effectiveOrigin.latitude, lng: effectiveOrigin.longitude };
    }
    if (hasValidDestination) {
      return { lat: effectiveDestination.latitude, lng: effectiveDestination.longitude };
    }
    // Default center (NYC)
    return { lat: 40.7128, lng: -74.0060 };
  }, [bounds, effectiveOrigin, effectiveDestination]);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: false,
      scrollwheel: true,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
    }),
    []
  );

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (onLocationUpdate && e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        onLocationUpdate(lat, lng);
      }
    },
    [onLocationUpdate]
  );

  // Traveled path: origin -> every location update in chronological order -> current
  // location. Redrawn from scratch whenever a new location comes in, so the line
  // always follows the shipment's actual shape rather than a single fixed curve.
  const traveledPath = useMemo(() => {
    const points: { lat: number; lng: number }[] = [];

    if (isValidCoordinate(effectiveOrigin)) {
      points.push({ lat: effectiveOrigin.latitude, lng: effectiveOrigin.longitude });
    }

    const sortedNotes = [...geoNotes].sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return ta - tb;
    });
    for (const n of sortedNotes) {
      points.push({ lat: n.latitude as number, lng: n.longitude as number });
    }

    if (currentLocation && isValidCoordinate(currentLocation)) {
      points.push({ lat: currentLocation.latitude, lng: currentLocation.longitude });
    }

    // Drop consecutive duplicate points (e.g. current location already logged as a note)
    return points.filter((p, i) => {
      if (i === 0) return true;
      const prev = points[i - 1];
      return Math.abs(prev.lat - p.lat) > 0.0001 || Math.abs(prev.lng - p.lng) > 0.0001;
    });
  }, [effectiveOrigin, geoNotes, currentLocation]);

  // Remaining route: last known position -> destination, shown lighter/dashed
  // to distinguish "where it's been" from "where it's going".
  const remainingPath = useMemo(() => {
    if (!isValidCoordinate(effectiveDestination)) return [];
    const from = traveledPath.length > 0
      ? traveledPath[traveledPath.length - 1]
      : isValidCoordinate(effectiveOrigin)
        ? { lat: effectiveOrigin.latitude, lng: effectiveOrigin.longitude }
        : null;
    if (!from) return [];
    return [from, { lat: effectiveDestination.latitude, lng: effectiveDestination.longitude }];
  }, [traveledPath, effectiveOrigin, effectiveDestination]);

  if (loadError) {
    return (
      <Box h={height} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Map Error"
          color="red"
          variant="light"
        >
          Failed to load Google Maps. Please check your API key configuration.
        </Alert>
      </Box>
    );
  }

  if (!isLoaded) {
    return (
      <Box
        h={height}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Text c="dimmed">Loading map...</Text>
      </Box>
    );
  }

  if (!apiKey) {
    return (
      <Box h={height} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Configuration Error"
          color="yellow"
          variant="light"
        >
          Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your
          environment variables.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      h={height}
      style={{
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
        cursor: onLocationUpdate ? "crosshair" : "default",
      }}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={4}
        options={{
          ...mapOptions,
          clickableIcons: !!onLocationUpdate,
        }}
        onLoad={(map) => {
          // Fit bounds to show all markers (only if coordinates are valid)
          const boundsObj = new google.maps.LatLngBounds();
          let hasValidPoints = false;
          
          if (isValidCoordinate(effectiveOrigin)) {
            boundsObj.extend(new google.maps.LatLng(effectiveOrigin.latitude, effectiveOrigin.longitude));
            hasValidPoints = true;
          }
          if (isValidCoordinate(effectiveDestination)) {
            boundsObj.extend(
              new google.maps.LatLng(effectiveDestination.latitude, effectiveDestination.longitude)
            );
            hasValidPoints = true;
          }
          if (currentLocation && isValidCoordinate(currentLocation)) {
            boundsObj.extend(
              new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude)
            );
            hasValidPoints = true;
          }
          for (const n of geoNotes) {
            boundsObj.extend(new google.maps.LatLng(n.latitude as number, n.longitude as number));
          }

          // Only fit bounds if we have at least two valid points (for proper zoom)
          // If only one point, just center on it, zoomed well out
          if (hasValidPoints) {
            if (boundsObj.isEmpty() || (!isValidCoordinate(effectiveOrigin) && !isValidCoordinate(effectiveDestination))) {
              // If we only have current location, just center on it, zoomed out
              if (currentLocation && isValidCoordinate(currentLocation)) {
                map.setCenter(new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude));
                map.setZoom(7);
              }
            } else {
              // Generous padding keeps the whole route comfortably inside the
              // viewport so the map opens zoomed OUT, not tight on the pins.
              map.fitBounds(boundsObj, {
                top: 80,
                right: 80,
                bottom: 80,
                left: 80,
              });
              map.setOptions({ minZoom: 3 });
              // After fitBounds, clamp how far in it's allowed to zoom (e.g. a
              // short local route shouldn't snap in tight either).
              google.maps.event.addListenerOnce(map, "idle", () => {
                const z = map.getZoom();
                if (z !== undefined && z > 9) map.setZoom(9);
              });
            }
          }
        }}
        onClick={handleMapClick}
      >
        {/* Origin Marker - only render if coordinates are valid */}
        {isValidCoordinate(effectiveOrigin) && (
          <>
            <Marker
              position={{ lat: effectiveOrigin.latitude, lng: effectiveOrigin.longitude }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#22c55e",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
            />
            <OverlayView
              position={{ lat: effectiveOrigin.latitude, lng: effectiveOrigin.longitude }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                style={{
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                  top: "-32px",
                  left: "50%",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "12px",
                    textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 2px #000",
                  }}
                >
                  Origin
                </span>
              </div>
            </OverlayView>
          </>
        )}

        {/* Destination Marker - only render if coordinates are valid */}
        {isValidCoordinate(effectiveDestination) && (
          <>
            <Marker
              position={{ lat: effectiveDestination.latitude, lng: effectiveDestination.longitude }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#ef4444",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
            />
            <OverlayView
              position={{ lat: effectiveDestination.latitude, lng: effectiveDestination.longitude }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                style={{
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                  top: "-32px",
                  left: "50%",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "12px",
                    textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 2px #000",
                  }}
                >
                  Destination
                </span>
              </div>
            </OverlayView>
          </>
        )}

        {/* Prior location updates with notes */}
        {historyPins.map((pin, idx) => (
            <Marker
              key={`hist-${idx}-${pin.latitude}-${pin.longitude}`}
              position={{ lat: pin.latitude!, lng: pin.longitude! }}
              title={pin.note || "Location update"}
              onClick={() => openNote(pin)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: "#f97316",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
            />
        ))}

        {/* Current Location Marker (Yellow Star) */}
        {currentLocation && currentNote && (
          <>
            <Marker
              position={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
              title="Shipment (current location)"
              onClick={() => openNote(currentNote)}
              icon={{
                path: "M 12,2 15,9 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,9 z",
                scale: 1.5,
                fillColor: "#facc15",
                fillOpacity: 1,
                strokeColor: "#854d0e",
                strokeWeight: 2,
                anchor: new google.maps.Point(12, 12),
              }}
            />
            <OverlayView
              position={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                style={{
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                  top: "-28px",
                  left: "50%",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "12px",
                    textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 2px #000",
                  }}
                >
                  Shipment
                </span>
              </div>
            </OverlayView>
          </>
        )}

        {activeNote && activeNote.latitude != null && activeNote.longitude != null && (
          <InfoWindow
            position={{ lat: activeNote.latitude, lng: activeNote.longitude }}
            onCloseClick={() => setActiveNote(null)}
          >
            <Box p="xs" maw={280}>
              <Stack gap="xs">
                <Text size="sm" fw={700} c="gray.8">
                  {currentNote &&
                  currentNote.latitude != null &&
                  currentNote.longitude != null &&
                  Math.abs(activeNote.latitude - currentNote.latitude) < 0.0001 &&
                  Math.abs(activeNote.longitude - currentNote.longitude) < 0.0001
                    ? "Current Location"
                    : "Location Update"}
                </Text>

                {!hideCoordinates && (
                  <MantineGroup gap="xs" wrap="nowrap" align="flex-start">
                    <IconMapPin size={14} style={{ marginTop: 3, flexShrink: 0 }} />
                    <Text size="xs">
                      {activeNote.latitude.toFixed(6)}, {activeNote.longitude.toFixed(6)}
                    </Text>
                  </MantineGroup>
                )}

                {activeNote.timestamp && (
                  <MantineGroup gap="xs" wrap="nowrap" align="flex-start">
                    <IconClock size={14} style={{ marginTop: 3, flexShrink: 0 }} />
                    <Text size="xs">
                      {dayjs(activeNote.timestamp).format("MMM DD, YYYY HH:mm")}
                    </Text>
                  </MantineGroup>
                )}

                {activeNote.note ? (
                  <>
                    <Divider />
                    <Stack gap={4}>
                      <MantineGroup gap="xs">
                        <IconNotes size={14} />
                        <Text size="xs" fw={600}>
                          Note
                        </Text>
                      </MantineGroup>
                      <Text size="xs" fs="italic" c="gray.7" style={{ wordBreak: "break-word" }}>
                        &ldquo;{activeNote.note}&rdquo;
                      </Text>
                    </Stack>
                  </>
                ) : (
                  <Text size="xs" c="dimmed">
                    No note for this location
                  </Text>
                )}
              </Stack>
            </Box>
          </InfoWindow>
        )}

        {/* Traveled path - the actual shape the shipment has moved through so far */}
        {traveledPath.length >= 2 && (
          <Polyline
            path={traveledPath}
            options={{
              strokeColor: "#3b82f6",
              strokeOpacity: 0.9,
              strokeWeight: 4,
              geodesic: true,
            }}
          />
        )}

        {/* Remaining route - last known position to destination, de-emphasized */}
        {remainingPath.length === 2 && (
          <Polyline
            path={remainingPath}
            options={{
              strokeColor: "#94a3b8",
              strokeOpacity: 0,
              strokeWeight: 2,
              geodesic: true,
              icons: [
                {
                  icon: { path: "M 0,-1 0,1", strokeOpacity: 0.7, scale: 3 },
                  offset: "0",
                  repeat: "12px",
                },
              ],
            }}
          />
        )}
      </GoogleMap>
      {isGeocoding && (
        <Box
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "8px 12px",
            borderRadius: "4px",
            zIndex: 1,
          }}
        >
          <Text size="sm" fw={500}>
            Geocoding addresses...
          </Text>
        </Box>
      )}
      {geocodingError && (
        <Box
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "8px 12px",
            borderRadius: "4px",
            zIndex: 1,
          }}
        >
          <Alert icon={<IconAlertCircle size={16} />} title="Geocoding Warning" color="yellow" variant="light" p="xs">
            <Text size="sm">{geocodingError}</Text>
          </Alert>
        </Box>
      )}
      {onLocationUpdate && (
        <Box
          style={{
            position: "absolute",
            top: isGeocoding || geocodingError ? 60 : 10,
            left: 10,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: "8px 12px",
            borderRadius: "4px",
            zIndex: 1,
          }}
        >
          <Text size="sm" fw={500}>
            Click on the map to update location
          </Text>
        </Box>
      )}
      {notesHistory.length > 0 && (
        <Paper
          shadow="sm"
          withBorder
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 260,
            maxHeight: "calc(100% - 20px)",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: "rgba(255, 255, 255, 0.96)",
          }}
        >
          <Box px="sm" py="xs" style={{ borderBottom: "1px solid #e9ecef" }}>
            <MantineGroup gap="xs">
              <IconNotes size={14} />
              <Text size="xs" fw={700}>
                Notes History
              </Text>
            </MantineGroup>
          </Box>
          <ScrollArea.Autosize mah={220} type="auto">
            <Stack gap={0} p="xs">
              {notesHistory.map((entry, idx) => {
                const hasCoords =
                  entry.latitude != null &&
                  entry.longitude != null &&
                  !(entry.latitude === 0 && entry.longitude === 0);
                return (
                  <Box
                    key={`note-hist-${idx}-${entry.timestamp ?? idx}`}
                    py="xs"
                    px={4}
                    style={{
                      borderBottom:
                        idx < notesHistory.length - 1 ? "1px solid #f1f3f5" : undefined,
                      cursor: hasCoords ? "pointer" : "default",
                    }}
                    onClick={() => {
                      if (hasCoords) openNote(entry);
                    }}
                  >
                    {entry.timestamp && (
                      <Text size="xs" c="dimmed" mb={2}>
                        {dayjs(entry.timestamp).format("MMM DD, YYYY HH:mm")}
                      </Text>
                    )}
                    <Text size="xs" style={{ wordBreak: "break-word" }}>
                      {entry.note}
                    </Text>
                    {hasCoords && (
                      <Text size="xs" c="orange.7" mt={2}>
                        View on map
                      </Text>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </ScrollArea.Autosize>
        </Paper>
      )}
    </Box>
  );
};

export default ShipmentTrackingMap;
