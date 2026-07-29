"use client";

import type { Coordinates } from "@/domain/types";

/** Seller pickup coordinates — required for publish; no Amsterdam fallback. */
export function getSellerCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => reject(new Error("Location permission denied.")),
      { timeout: 10_000, maximumAge: 60_000, enableHighAccuracy: true },
    );
  });
}

export async function resolveSellerNeighborhood(
  coords: Coordinates,
): Promise<string> {
  const params = new URLSearchParams({
    lat: String(coords.lat),
    lng: String(coords.lng),
  });
  const res = await fetch(`/api/geocode?${params.toString()}`);
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Could not resolve your area.");
  }
  const data = (await res.json()) as { neighborhood: string };
  return data.neighborhood;
}
