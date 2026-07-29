/** Reverse-geocode via Nominatim (OpenStreetMap). Server-only — called from /api/geocode. */

const CACHE = new Map<string, { neighborhood: string; expires: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;
const USER_AGENT = "SecondLifeFlowers/1.0 (https://github.com/azbykov/flowers-alive)";

function cacheKey(lat: number, lng: number): string {
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return `${r(lat)},${r(lng)}`;
}

/** Pick the narrowest useful public area label from a Nominatim address block. */
export function neighborhoodFromAddress(
  address: Record<string, string> | undefined,
): string {
  if (!address) return "Nearby";
  const priority = [
    "suburb",
    "neighbourhood",
    "city_district",
    "borough",
    "quarter",
    "city",
    "town",
    "village",
    "municipality",
  ];
  for (const key of priority) {
    const value = address[key];
    if (value?.trim()) return value.trim();
  }
  return address.road?.trim() || address.county?.trim() || "Nearby";
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const key = cacheKey(lat, lng);
  const hit = CACHE.get(key);
  if (hit && hit.expires > Date.now()) return hit.neighborhood;

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "json");
  url.searchParams.set("zoom", "14");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (!res.ok) {
    throw new Error(`Geocoder returned ${res.status}`);
  }

  const data = (await res.json()) as { address?: Record<string, string> };
  const neighborhood = neighborhoodFromAddress(data.address);
  CACHE.set(key, { neighborhood, expires: Date.now() + CACHE_TTL_MS });
  return neighborhood;
}
