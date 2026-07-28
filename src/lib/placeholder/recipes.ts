import type { FlowerType } from "@/domain/types";

/** Which head component (see `src/components/placeholder/heads`) draws this flower type. */
export type HeadKind = "swirl" | "cup" | "ruffle" | "cluster" | "star" | "thread" | "sun";

export interface Palette {
  /** Matched against an optional color hint, e.g. "blue" for blue hydrangeas. */
  name: string;
  bg: string;
  /** Candidate base colors; one is picked per head for subtle in-bouquet variety. */
  heads: string[];
  center: string;
}

export interface FlowerRecipe {
  kind: HeadKind;
  palettes: Palette[];
  headCount: [min: number, max: number];
  headRadius: [min: number, max: number];
  /** Base distance between head centers in the golden-angle layout. */
  spread?: number;
}

export const BACKGROUNDS = ["#f7f3ea", "#f0f4fa", "#fdf1f0", "#f3f6f0", "#faf3e9", "#f5f0f7"];

export const STEM_GREENS = ["#3f7a52", "#4d8a5c", "#356a46", "#5c9463"];

export const MIXED_KINDS: HeadKind[] = ["swirl", "ruffle", "star"];

export const RECIPES: Record<FlowerType, FlowerRecipe> = {
  roses: {
    kind: "swirl",
    headCount: [5, 7],
    headRadius: [24, 34],
    palettes: [
      { name: "pink", bg: "#fdf1f0", heads: ["#e8a0b4", "#f2c1cd", "#d97a94"], center: "#b2536f" },
      { name: "red", bg: "#fdf3f2", heads: ["#c94f4f", "#e2807a", "#a83a3a"], center: "#7a2626" },
      { name: "white", bg: "#fdfaf3", heads: ["#f5ece0", "#fff8f0", "#e8dcc8"], center: "#d9c39f" },
      { name: "peach", bg: "#fdf6ee", heads: ["#f0b28a", "#f8d3ae", "#e0925f"], center: "#b5713a" },
    ],
  },
  tulips: {
    kind: "cup",
    headCount: [5, 7],
    headRadius: [22, 30],
    palettes: [
      { name: "yellow", bg: "#fdfaef", heads: ["#f2c94c", "#f7dd7f", "#e8b326"], center: "#c98f0f" },
      { name: "red", bg: "#fdf2f2", heads: ["#d94f4f", "#efa2a2", "#b23434"], center: "#7a2222" },
      { name: "purple", bg: "#f6f2fb", heads: ["#9b7fd1", "#c6b2e8", "#7c5fc0"], center: "#5a3f99" },
      { name: "white", bg: "#fbfaf3", heads: ["#f7f4ea", "#ffffff", "#e9e3d2"], center: "#cfc6a8" },
    ],
  },
  peonies: {
    kind: "ruffle",
    headCount: [3, 5],
    headRadius: [36, 46],
    palettes: [
      { name: "pink", bg: "#fdf3f6", heads: ["#f0a8c0", "#f9d0dd", "#e58aa8"], center: "#c25e82" },
      { name: "coral", bg: "#fdf4f1", heads: ["#f2917c", "#f8bfae", "#e0705a"], center: "#b5482f" },
      { name: "white", bg: "#fdf7f7", heads: ["#f8ecec", "#fff5f5", "#eddcdc"], center: "#d9bcbc" },
    ],
  },
  lilies: {
    kind: "star",
    headCount: [3, 5],
    headRadius: [32, 42],
    palettes: [
      { name: "white", bg: "#fbfaf3", heads: ["#fbfbf6", "#ffffff", "#eee7d2"], center: "#8a5a2b" },
      { name: "orange", bg: "#fdf3ea", heads: ["#f0862c", "#f7ad63", "#d9701a"], center: "#5c3311" },
      { name: "pink", bg: "#fbf1f4", heads: ["#e0629a", "#f0a0c4", "#c94a80"], center: "#7a2e4a" },
    ],
  },
  chrysanthemums: {
    kind: "thread",
    headCount: [4, 6],
    headRadius: [26, 34],
    palettes: [
      { name: "white", bg: "#fbfaf3", heads: ["#fbfbf6", "#ffffff", "#e9e4d2"], center: "#d9c78f" },
      { name: "yellow", bg: "#fdfaea", heads: ["#f4d35e", "#f9e59b", "#e0ba33"], center: "#a8791a" },
      { name: "burgundy", bg: "#fbf1f2", heads: ["#8c3a4d", "#b25a6c", "#6e2536"], center: "#4a1622" },
    ],
  },
  hydrangeas: {
    kind: "cluster",
    headCount: [2, 3],
    headRadius: [46, 58],
    spread: 36,
    palettes: [
      { name: "blue", bg: "#f0f4fa", heads: ["#8fa8d9", "#b3c4e8", "#9b8fd9"], center: "#6c7fb8" },
      { name: "pink", bg: "#fbf1f6", heads: ["#e8a0c0", "#f2c1d8", "#d97ab0"], center: "#b8558c" },
      { name: "white", bg: "#f5f5ef", heads: ["#f2f2ea", "#ffffff", "#e4e4d8"], center: "#cccbb8" },
    ],
  },
  sunflowers: {
    kind: "sun",
    headCount: [2, 4],
    headRadius: [42, 54],
    spread: 34,
    palettes: [
      { name: "yellow", bg: "#fbf7ea", heads: ["#f2c94c", "#f7dd7f"], center: "#5c3d1e" },
      { name: "orange", bg: "#fdf5ea", heads: ["#e8952c", "#f2b661"], center: "#3d2810" },
    ],
  },
  mixed: {
    kind: "cluster",
    headCount: [6, 8],
    headRadius: [20, 32],
    palettes: [
      { name: "garden", bg: "#fdf6ee", heads: ["#e8a0b4", "#fbfbf6", "#f4d35e"], center: "#b2536f" },
      { name: "pastel", bg: "#f3f6f0", heads: ["#f0a8c0", "#f2f2ea", "#f2c94c"], center: "#c25e82" },
      { name: "vivid", bg: "#fbf1f2", heads: ["#d94f4f", "#f2c94c", "#8c3a4d"], center: "#7a2222" },
    ],
  },
  other: {
    kind: "cluster",
    headCount: [4, 6],
    headRadius: [26, 38],
    palettes: [
      { name: "lavender", bg: "#f5f0f7", heads: ["#c9a3d6", "#a3c9c1", "#e0c68a"], center: "#8a7aa8" },
      { name: "blue", bg: "#f0f4fa", heads: ["#a8c0e0", "#e0b3c4", "#c4d9a3"], center: "#6f88b0" },
    ],
  },
};
