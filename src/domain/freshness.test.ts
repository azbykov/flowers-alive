import { describe, expect, it } from "vitest";
import { freshnessTier, remainingDaysLabel } from "./freshness";

describe("freshnessTier", () => {
  it("maps score to tiers at the 85/65/45 boundaries", () => {
    expect(freshnessTier(92)).toBe("very-fresh");
    expect(freshnessTier(85)).toBe("very-fresh");
    expect(freshnessTier(84)).toBe("fresh");
    expect(freshnessTier(65)).toBe("fresh");
    expect(freshnessTier(64)).toBe("fading");
    expect(freshnessTier(45)).toBe("fading");
    expect(freshnessTier(44)).toBe("wilting");
  });
});

describe("remainingDaysLabel", () => {
  const base = { score: 90, confidence: 80, signals: [] };
  it("formats ranges, single days and today", () => {
    expect(remainingDaysLabel({ ...base, remainingDaysMin: 5, remainingDaysMax: 6 })).toBe("5–6 days");
    expect(remainingDaysLabel({ ...base, remainingDaysMin: 1, remainingDaysMax: 1 })).toBe("~1 day");
    expect(remainingDaysLabel({ ...base, remainingDaysMin: 0, remainingDaysMax: 0 })).toBe("Enjoy today");
  });
});
