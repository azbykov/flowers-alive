"use client";

import type { Coordinates } from "@/domain/types";
import { DEFAULT_CITY_CENTER } from "@/lib/config";

/**
 * Viewer position for distance ranking. Falls back to the demo city center
 * when permission is denied, so browse always works.
 */
export function getViewerLocation(): Promise<Coordinates> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(DEFAULT_CITY_CENTER);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(DEFAULT_CITY_CENTER),
      { timeout: 4000, maximumAge: 300_000 },
    );
  });
}
