import type { Coordinates } from "./types";

const EARTH_RADIUS_KM = 6371;

/** ~0.001° ≈ 100–110 m — public map grid so exact pickup pins stay private. */
const MAP_POINT_GRID = 0.001;

/** Circle radius on listing-detail approximate map (meters). */
export const APPROXIMATE_AREA_RADIUS_M = 280;

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

/**
 * Public map position: snapped to a ~100 m grid. Never equal to the exact
 * pickup coordinate unless it already sits on a grid node.
 */
export function toApproximateMapPoint(exact: Coordinates): Coordinates {
  return {
    lat: Math.round(exact.lat / MAP_POINT_GRID) * MAP_POINT_GRID,
    lng: Math.round(exact.lng / MAP_POINT_GRID) * MAP_POINT_GRID,
  };
}

const DISTANCE: Record<string, { near: string; km: (n: string) => string }> = {
  en: { near: "~100 m", km: (n) => `~${n} km` },
  ka: { near: "~100 მ", km: (n) => `~${n} კმ` },
  ru: { near: "~100 м", km: (n) => `~${n} км` },
};

export function distanceLabel(km: number | null, locale: string = "en"): string {
  if (km === null) return "";
  const msg = DISTANCE[locale] ?? DISTANCE.en;
  if (km < 0.1) return msg.near;
  return msg.km(km.toFixed(1));
}
