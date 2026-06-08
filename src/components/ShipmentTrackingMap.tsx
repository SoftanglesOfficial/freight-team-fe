"use client";

import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader, OverlayView, InfoWindow } from "@react-google-maps/api";
import { Box, Text, Alert, Stack, Divider, Group as MantineGroup } from "@mantine/core";
import { IconAlertCircle, IconMapPin, IconClock, IconNotes } from "@tabler/icons-react";
import dayjs from "dayjs";

interface Location {
  latitude: number;
  longitude: number;
}

interface ShipmentTrackingMapProps {
  origin: Location;
  destination: Location;
  currentLocation?: Location;
  onLocationUpdate?: (lat: number, lng: number) => void;
  height?: string;
  originAddress?: string; // Optional: formatted address string for geocoding
  destinationAddress?: string; // Optional: formatted address string for geocoding
  lastNote?: string;
  lastUpdate?: string | Date;
  hideCoordinates?: boolean;
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
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [showInfoWindow, setShowInfoWindow] = useState(false);

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
  }, [effectiveOrigin, effectiveDestination, currentLocation]);

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

  // Route path for polyline - only use valid coordinates
  const routePath = useMemo(() => {
    if (isValidCoordinate(effectiveOrigin) && isValidCoordinate(effectiveDestination)) {
      return [
        { lat: effectiveOrigin.latitude, lng: effectiveOrigin.longitude },
        { lat: effectiveDestination.latitude, lng: effectiveDestination.longitude },
      ];
    }
    return [];
  }, [effectiveOrigin, effectiveDestination]);

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
        zoom={6}
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
          
          // Only fit bounds if we have at least two valid points (for proper zoom)
          // If only one point, just center on it
          if (hasValidPoints) {
            if (boundsObj.isEmpty() || (!isValidCoordinate(effectiveOrigin) && !isValidCoordinate(effectiveDestination))) {
              // If we only have current location, just center on it
              if (currentLocation && isValidCoordinate(currentLocation)) {
                map.setCenter(new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude));
                map.setZoom(12);
              }
            } else {
              // Use minimal padding (10px) to keep markers near boundary walls
              // This ensures both origin and destination are visible but stay close to map edges
              map.fitBounds(boundsObj, {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10,
              });
              map.setOptions({ minZoom: 3 });
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

        {/* Current Location Marker (Yellow Star) */}
        {currentLocation && (
          <>
            <Marker
              position={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
              title="Shipment (current location)"
              onClick={() => setShowInfoWindow(!showInfoWindow)}
              icon={{
                path: "M 12,2 15,9 22,9 17,14 18,21 12,18 6,21 7,14 2,9 9,9 z",
                scale: 1.5,
                fillColor: "#facc15", // yellow-400
                fillOpacity: 1,
                strokeColor: "#854d0e", // yellow-900
                strokeWeight: 2,
                anchor: new google.maps.Point(12, 12),
              }}
            />
            {showInfoWindow && (
              <InfoWindow
                position={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
                onCloseClick={() => setShowInfoWindow(false)}
              >
                <Box p="xs" maw={250}>
                  <Stack gap="xs">
                    <Text size="sm" fw={700} c="gray.8">Current Location</Text>
                    
                    {!hideCoordinates && (
                      <MantineGroup gap="xs" wrap="nowrap" align="flex-start">
                        <IconMapPin size={14} style={{ marginTop: 3, flexShrink: 0 }} />
                        <Text size="xs">
                          {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                        </Text>
                      </MantineGroup>
                    )}

                    {lastUpdate && (
                      <MantineGroup gap="xs" wrap="nowrap" align="flex-start">
                        <IconClock size={14} style={{ marginTop: 3, flexShrink: 0 }} />
                        <Text size="xs">
                          {dayjs(lastUpdate).format("MMM DD, YYYY HH:mm")}
                        </Text>
                      </MantineGroup>
                    )}

                    {lastNote && (
                      <>
                        <Divider />
                        <Stack gap={4}>
                          <MantineGroup gap="xs">
                            <IconNotes size={14} />
                            <Text size="xs" fw={600}>Last Note:</Text>
                          </MantineGroup>
                          <Text size="xs" fs="italic" c="gray.7" style={{ wordBreak: 'break-word' }}>
                            "{lastNote}"
                          </Text>
                        </Stack>
                      </>
                    )}
                  </Stack>
                </Box>
              </InfoWindow>
            )}
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

        {/* Route Polyline - only render if both coordinates are valid */}
        {isValidCoordinate(effectiveOrigin) && isValidCoordinate(effectiveDestination) && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: "#3b82f6",
              strokeOpacity: 0.8,
              strokeWeight: 3,
              geodesic: true,
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
    </Box>
  );
};

export default ShipmentTrackingMap;
