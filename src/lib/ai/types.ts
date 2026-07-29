import type { BouquetAnalysis, FreshnessReport } from "@/domain/types";

/**
 * Raw multi-signal observation of the bouquet photos. One vision request
 * produces this; downstream modules consume different projections of it.
 * Deliberately contains NO price information — AI never touches pricing.
 */
export interface ImageObservation {
  flowersSeen: { type: string; name: string; count?: number }[];
  colorPalette: string[];
  petalCondition: string[]; // e.g. "petals firm and unblemished"
  leafCondition: string[];
  stemCondition: string[];
  visibleDamage: string[];
  photo: {
    sharpness: "sharp" | "acceptable" | "blurry";
    lighting: "good" | "dim" | "harsh";
    framing: "full bouquet visible" | "partially cropped";
  };
  freshness: {
    score: number; // 0–100
    remainingDaysMin: number;
    remainingDaysMax: number;
    confidence: number; // 0–100
  };
}

export interface AiVisionProvider {
  readonly name: string;
  observe(imagesBase64: string[], locale?: string): Promise<ImageObservation>;
}

export interface AnalyzeResult {
  analysis: BouquetAnalysis;
  freshness: FreshnessReport;
  provider: string;
}
