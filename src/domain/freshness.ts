import type { FreshnessReport } from "./types";

/** Handoff freshness scale: ≥85 very fresh, 65–84 fresh, 45–64 fading, <45 wilting. */
export type FreshnessTier = "very-fresh" | "fresh" | "fading" | "wilting";

export function freshnessTier(score: number): FreshnessTier {
  if (score >= 85) return "very-fresh";
  if (score >= 65) return "fresh";
  if (score >= 45) return "fading";
  return "wilting";
}

type RemainingDaysMessages = {
  enjoyToday: string;
  oneDay: string;
  nDays: (n: number) => string;
  range: (min: number, max: number) => string;
};

const REMAINING: Record<string, RemainingDaysMessages> = {
  en: {
    enjoyToday: "Enjoy today",
    oneDay: "~1 day",
    nDays: (n) => `~${n} days`,
    range: (min, max) => `${min}–${max} days`,
  },
  ka: {
    enjoyToday: "დღეს დატკბით",
    oneDay: "~1 დღე",
    nDays: (n) => `~${n} დღე`,
    range: (min, max) => `${min}–${max} დღე`,
  },
  ru: {
    enjoyToday: "Наслаждайтесь сегодня",
    oneDay: "~1 день",
    nDays: (n) => `~${n} дн.`,
    range: (min, max) => `${min}–${max} дн.`,
  },
};

export function remainingDaysLabel(
  report: FreshnessReport,
  locale: string = "en",
): string {
  const msg = REMAINING[locale] ?? REMAINING.en;
  const { remainingDaysMin: min, remainingDaysMax: max } = report;
  if (max <= 0) return msg.enjoyToday;
  if (min === max) return max === 1 ? msg.oneDay : msg.nDays(max);
  return msg.range(min, max);
}
