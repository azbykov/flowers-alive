import type { Coordinates } from "./types";

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Distance as shown to buyers: rounded to 0.1 km so precise coordinates
 * cannot be triangulated from the UI.
 */
export function approximateDistanceKm(a: Coordinates, b: Coordinates): number {
  return Math.round(haversineKm(a, b) * 10) / 10;
}

export function distanceLabel(km: number | null): string {
  if (km === null) return "";
  if (km < 0.1) return "~100 m";
  return `~${km.toFixed(1)} km`;
}
