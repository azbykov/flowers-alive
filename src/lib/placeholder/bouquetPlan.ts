import type { FlowerType } from "@/domain/types";
import { hashSeed, mulberry32, pick } from "./color";
import { BACKGROUNDS, MIXED_KINDS, RECIPES, STEM_GREENS, type HeadKind } from "./recipes";

const CANVAS_HEIGHT = 300;

export interface HeadPlan {
  kind: HeadKind;
  cx: number;
  cy: number;
  r: number;
  /** Single resolved color — head components derive their own shading from it. */
  color: string;
  center: string;
}

export interface StemPlan {
  baseX: number;
  ctrlX: number;
  ctrlY: number;
  bindX: number;
  bindY: number;
  color: string;
}

export interface BouquetPlan {
  background: string;
  heads: HeadPlan[];
  stems: StemPlan[];
}

/**
 * Deterministic bouquet layout for `flowerType`, varied by `seed`.
 * `colorHint` (e.g. "blue", "pink") biases the palette toward a matching
 * variant when the listing already describes a specific color. Pure data —
 * rendering happens in `BouquetIllustration` and the `heads/*` components.
 */
export function buildBouquetPlan(flowerType: FlowerType, seed: string, colorHint?: string): BouquetPlan {
  const recipe = RECIPES[flowerType] ?? RECIPES.other;
  const rng = mulberry32(hashSeed(`${flowerType}:${seed}`));

  const matching = colorHint
    ? recipe.palettes.filter(
        (p) => p.name.includes(colorHint.toLowerCase()) || colorHint.toLowerCase().includes(p.name),
      )
    : [];
  const palette = pick(rng, matching.length > 0 ? matching : recipe.palettes);
  const background = flowerType === "mixed" || flowerType === "other" ? pick(rng, BACKGROUNDS) : palette.bg;
  const stemColor = pick(rng, STEM_GREENS);

  const [minCount, maxCount] = recipe.headCount;
  const count = minCount + Math.floor(rng() * (maxCount - minCount + 1));
  const [minR, maxR] = recipe.headRadius;

  const centerX = 195 + (rng() - 0.5) * 20;
  const centerY = 150 + (rng() - 0.5) * 16;
  const goldenAngle = 137.508;
  const startAngle = rng() * 360;
  const mixedOffset = Math.floor(rng() * MIXED_KINDS.length);
  const spread = recipe.spread ?? 27;

  const heads: HeadPlan[] = [];
  for (let i = 0; i < count; i++) {
    const angle = ((startAngle + i * goldenAngle) * Math.PI) / 180;
    const dist = Math.sqrt(i + 0.5) * (spread + rng() * 6);
    const cx = centerX + Math.cos(angle) * dist * 1.15;
    const cy = centerY + Math.sin(angle) * dist * 0.82 - dist * 0.12;
    const r = minR + rng() * (maxR - minR);
    const kind = flowerType === "mixed" ? MIXED_KINDS[(i + mixedOffset) % MIXED_KINDS.length] : recipe.kind;
    heads.push({ kind, cx, cy, r, color: pick(rng, palette.heads), center: palette.center });
  }
  heads.sort((a, b) => a.cy - b.cy);

  const minX = Math.min(...heads.map((h) => h.cx - h.r));
  const maxX = Math.max(...heads.map((h) => h.cx + h.r));
  const clusterBottomY = Math.max(...heads.map((h) => h.cy + h.r * 0.3));
  const bindX = (minX + maxX) / 2;
  const bindY = clusterBottomY + 8;

  const stemCount = 3 + Math.floor(rng() * 3);
  const stems: StemPlan[] = Array.from({ length: stemCount }, (_, i) => {
    const offset = (i - (stemCount - 1) / 2) * 14;
    return {
      baseX: bindX + offset * 1.6 + (rng() - 0.5) * 6,
      ctrlX: bindX + offset * 0.5,
      ctrlY: (bindY + CANVAS_HEIGHT) / 2,
      bindX,
      bindY,
      color: stemColor,
    };
  });

  return { background, heads, stems };
}
