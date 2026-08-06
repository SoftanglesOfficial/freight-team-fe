import type { MapLocationNote } from "@/components/ShipmentTrackingMap";

type HistoryEntry = {
  note?: string;
  timestamp?: string | Date;
  location?: { latitude?: number; longitude?: number };
};

/** Extract map pins from status history entries that include coordinates. */
export function locationNotesFromHistory(
  history?: HistoryEntry[] | null,
): MapLocationNote[] {
  if (!history?.length) return [];
  return history
    .filter(
      (e) =>
        e.location &&
        Number.isFinite(e.location.latitude) &&
        Number.isFinite(e.location.longitude) &&
        !(e.location.latitude === 0 && e.location.longitude === 0),
    )
    .map((e) => ({
      latitude: e.location!.latitude!,
      longitude: e.location!.longitude!,
      note: e.note,
      timestamp: e.timestamp,
    }));
}
