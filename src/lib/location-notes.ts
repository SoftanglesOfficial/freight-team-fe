import type { MapLocationNote } from "@/components/ShipmentTrackingMap";

type HistoryEntry = {
  note?: string;
  timestamp?: string | Date;
  location?: { latitude?: number; longitude?: number };
};

function hasValidCoords(location?: {
  latitude?: number;
  longitude?: number;
}): boolean {
  if (!location) return false;
  if (
    !Number.isFinite(location.latitude) ||
    !Number.isFinite(location.longitude)
  ) {
    return false;
  }
  if (location.latitude === 0 && location.longitude === 0) return false;
  return true;
}

/** Extract all status-history notes for the map (with or without coordinates). */
export function locationNotesFromHistory(
  history?: HistoryEntry[] | null,
): MapLocationNote[] {
  if (!history?.length) return [];
  return history
    .filter((e) => !!e.note || hasValidCoords(e.location))
    .map((e) => {
      const withCoords = hasValidCoords(e.location);
      return {
        latitude: withCoords ? e.location!.latitude! : undefined,
        longitude: withCoords ? e.location!.longitude! : undefined,
        note: e.note,
        timestamp: e.timestamp,
      };
    });
}
