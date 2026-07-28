import type { FlowerType } from "@/domain/types";

/**
 * Path to the on-demand bouquet placeholder route (see `BouquetIllustration`
 * and `renderBouquetSvg`), used when a listing has no real photo. Cacheable
 * and safe to use directly as an `<img src>`.
 */
export function bouquetPlaceholderUrl(flowerType: FlowerType, seed: string, colorHint?: string): string {
  const params = new URLSearchParams({ seed });
  if (colorHint) params.set("color", colorHint);
  return `/api/placeholder/${flowerType}?${params.toString()}`;
}
