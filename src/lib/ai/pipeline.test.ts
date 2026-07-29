import { describe, expect, it } from "vitest";
import { analyzeBouquet } from "./pipeline";
import type { AiVisionProvider, ImageObservation } from "./types";

function providerWith(obs: Partial<ImageObservation>): AiVisionProvider {
  return {
    name: "test",
    async observe() {
      return {
        flowersSeen: [{ type: "roses", name: "Roses", count: 11 }],
        colorPalette: ["blush pink"],
        petalCondition: ["healthy petals"],
        leafCondition: ["green leaves"],
        stemCondition: ["stems appear fresh"],
        visibleDamage: [],
        photo: { sharpness: "sharp", lighting: "good", framing: "full bouquet visible" },
        freshness: { score: 94, remainingDaysMin: 5, remainingDaysMax: 6, confidence: 83 },
        ...obs,
      };
    },
  };
}

describe("analyzeBouquet", () => {
  it("produces freshness with confidence and explanation signals", async () => {
    const { freshness } = await analyzeBouquet(["img"], providerWith({}));
    expect(freshness.score).toBe(94);
    expect(freshness.confidence).toBe(83);
    expect(freshness.signals).toContain("healthy petals");
  });

  it("clamps out-of-range model output", async () => {
    const { freshness } = await analyzeBouquet(
      ["img"],
      providerWith({
        freshness: { score: 140, remainingDaysMin: 6, remainingDaysMax: 2, confidence: -5 },
      }),
    );
    expect(freshness.score).toBe(100);
    expect(freshness.confidence).toBe(0);
    expect(freshness.remainingDaysMax).toBeGreaterThanOrEqual(freshness.remainingDaysMin);
  });

  it("classifies 3+ varieties as a mixed bouquet", async () => {
    const { analysis } = await analyzeBouquet(
      ["img"],
      providerWith({
        flowersSeen: [
          { type: "roses", name: "Roses" },
          { type: "lilies", name: "Lilies" },
          { type: "chrysanthemums", name: "Chrysanthemums" },
        ],
      }),
      "en",
    );
    expect(analysis.suggestedTitle.toLowerCase()).toContain("mixed");
  });

  it("localizes suggestions for Georgian", async () => {
    const { analysis } = await analyzeBouquet(
      ["img"],
      providerWith({
        photo: { sharpness: "blurry", lighting: "dim", framing: "partially cropped" },
      }),
      "ka",
    );
    expect(analysis.photoQuality).toBe("poor");
    expect(analysis.suggestions.join(" ")).toMatch(/განათება/);
  });

  it("downgrades quality and suggests fixes for bad photos", async () => {
    const { analysis } = await analyzeBouquet(
      ["img"],
      providerWith({
        photo: { sharpness: "blurry", lighting: "dim", framing: "partially cropped" },
      }),
      "en",
    );
    expect(analysis.photoQuality).toBe("poor");
    expect(analysis.suggestions.join(" ")).toMatch(/lighting/i);
  });

  it("maps unknown flower types to 'other'", async () => {
    const { analysis } = await analyzeBouquet(
      ["img"],
      providerWith({ flowersSeen: [{ type: "alien-flower", name: "Mystery" }] }),
    );
    expect(analysis.flowers[0].type).toBe("other");
  });

  it("never outputs any price field", async () => {
    const result = await analyzeBouquet(["img"], providerWith({}));
    expect(JSON.stringify(result).toLowerCase()).not.toContain("price");
  });
});
