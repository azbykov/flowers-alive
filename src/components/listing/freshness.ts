import { freshnessTier } from "@/domain/freshness";

/** Freshness score → design-system color (4-tier scale from the handoff). */
export function freshColor(score: number): string {
  switch (freshnessTier(score)) {
    case "very-fresh":
      return "var(--fresh-very)";
    case "fresh":
      return "var(--fresh-good)";
    case "fading":
      return "var(--fresh-fading)";
    case "wilting":
      return "var(--fresh-wilting)";
  }
}
