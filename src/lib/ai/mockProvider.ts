import type { AiVisionProvider, ImageObservation } from "./types";

/**
 * Deterministic stand-in for the vision model in demo mode: derives a stable
 * pseudo-observation from the image bytes so the same photo always yields the
 * same analysis. Zero cost, zero network.
 */

const SAMPLE_FLOWERS: ImageObservation["flowersSeen"][] = [
  [{ type: "roses", name: "Roses", count: 11 }],
  [{ type: "tulips", name: "Tulips", count: 15 }],
  [{ type: "peonies", name: "Peonies", count: 7 }],
  [
    { type: "roses", name: "Roses", count: 5 },
    { type: "lilies", name: "Lilies", count: 3 },
    { type: "chrysanthemums", name: "Chrysanthemums", count: 4 },
  ],
  [{ type: "hydrangeas", name: "Hydrangeas", count: 3 }],
  [{ type: "sunflowers", name: "Sunflowers", count: 9 }],
];

const PALETTES = [
  ["cream", "blush pink"],
  ["red", "deep green"],
  ["yellow", "orange"],
  ["white", "lavender"],
  ["pink", "white"],
];

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const mockVisionProvider: AiVisionProvider = {
  name: "mock",
  async observe(imagesBase64: string[]): Promise<ImageObservation> {
    // Sample the payload instead of hashing megabytes.
    const sample = imagesBase64
      .map((img) => img.slice(100, 400) + img.length)
      .join("|");
    const seed = hashString(sample);

    const flowers = SAMPLE_FLOWERS[seed % SAMPLE_FLOWERS.length];
    const palette = PALETTES[(seed >> 3) % PALETTES.length];
    const score = 62 + (seed % 36); // 62–97
    const confidence = 70 + ((seed >> 5) % 25); // 70–94
    const daysMax = Math.max(1, Math.round((score / 100) * 7));
    const fresh = score >= 80;

    return {
      flowersSeen: flowers,
      colorPalette: palette,
      petalCondition: fresh
        ? ["healthy petals", "no browning"]
        : ["slight browning on outer petals"],
      leafCondition: fresh ? ["green leaves"] : ["a few yellowing leaves"],
      stemCondition: ["stems appear fresh"],
      visibleDamage: seed % 7 === 0 ? ["one bent stem"] : [],
      photo: {
        sharpness: seed % 11 === 0 ? "acceptable" : "sharp",
        lighting: seed % 13 === 0 ? "dim" : "good",
        framing: "full bouquet visible",
      },
      freshness: {
        score,
        remainingDaysMin: Math.max(0, daysMax - 1),
        remainingDaysMax: daysMax,
        confidence,
      },
    };
  },
};
