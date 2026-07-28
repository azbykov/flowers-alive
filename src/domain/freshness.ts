import type { FreshnessReport } from "./types";

/** Handoff freshness scale: ≥85 very fresh, 65–84 fresh, 45–64 fading, <45 wilting. */
export type FreshnessTier = "very-fresh" | "fresh" | "fading" | "wilting";

export function freshnessTier(score: number): FreshnessTier {
  if (score >= 85) return "very-fresh";
  if (score >= 65) return "fresh";
  if (score >= 45) return "fading";
  return "wilting";
}

export function remainingDaysLabel(report: FreshnessReport): string {
  const { remainingDaysMin: min, remainingDaysMax: max } = report;
  if (max <= 0) return "Enjoy today";
  if (min === max) return `~${max} day${max === 1 ? "" : "s"}`;
  return `${min}–${max} days`;
}
