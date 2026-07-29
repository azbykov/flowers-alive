import { config } from "@/lib/config";
import { analyzeBouquet } from "./pipeline";
import { mockVisionProvider } from "./mockProvider";
import type { AnalyzeResult } from "./types";

const analysisCache = new Map<string, AnalyzeResult>();
const CACHE_LIMIT = 200;

function cacheKey(images: string[], locale: string): string {
  return `${locale}|${images.map((i) => `${i.length}:${i.slice(50, 120)}`).join("|")}`;
}

/** Analyze a photo set; identical photo sets + locale are served from cache. */
export async function analyzeBouquetPhotos(
  imagesBase64: string[],
  locale: string = "ka",
): Promise<AnalyzeResult> {
  const key = cacheKey(imagesBase64, locale);
  const cached = analysisCache.get(key);
  if (cached) return cached;

  const provider = config.hasOpenAI
    ? (await import("./openaiProvider")).openaiVisionProvider
    : mockVisionProvider;

  const result = await analyzeBouquet(imagesBase64, provider, locale);
  if (analysisCache.size >= CACHE_LIMIT) {
    const oldest = analysisCache.keys().next().value;
    if (oldest !== undefined) analysisCache.delete(oldest);
  }
  analysisCache.set(key, result);
  return result;
}
