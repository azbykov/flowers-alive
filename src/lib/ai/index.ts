import { config } from "@/lib/config";
import { analyzeBouquet } from "./pipeline";
import { mockVisionProvider } from "./mockProvider";
import type { AnalyzeResult } from "./types";

const analysisCache = new Map<string, AnalyzeResult>();
const CACHE_LIMIT = 200;

function cacheKey(images: string[]): string {
  return images.map((i) => `${i.length}:${i.slice(50, 120)}`).join("|");
}

/** Analyze a photo set; identical photo sets are served from cache (cost control). */
export async function analyzeBouquetPhotos(
  imagesBase64: string[],
): Promise<AnalyzeResult> {
  const key = cacheKey(imagesBase64);
  const cached = analysisCache.get(key);
  if (cached) return cached;

  const provider = config.hasOpenAI
    ? (await import("./openaiProvider")).openaiVisionProvider
    : mockVisionProvider;

  const result = await analyzeBouquet(imagesBase64, provider);
  if (analysisCache.size >= CACHE_LIMIT) {
    const oldest = analysisCache.keys().next().value;
    if (oldest !== undefined) analysisCache.delete(oldest);
  }
  analysisCache.set(key, result);
  return result;
}
