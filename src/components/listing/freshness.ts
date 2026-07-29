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

/** Hex colors for map overlays (CSS vars may not resolve inside map panes). */
export function freshColorHex(score: number): string {
  switch (freshnessTier(score)) {
    case "very-fresh":
      return "#3f7d52";
    case "fresh":
      return "#6d9a4f";
    case "fading":
      return "#d98324";
    case "wilting":
      return "#c0492f";
  }
}
