import { describe, expect, it } from "vitest";
import { clusterListings } from "./cluster";
import type { PublicListing } from "@/domain/types";

function listing(
  id: string,
  lat: number,
  lng: number,
  priceCents = 500,
): PublicListing {
  return {
    id,
    seller: { id: "s", displayName: "S", contact: "@s" },
    title: id,
    description: "",
    priceCents,
    currency: "EUR",
    flowerTypes: ["roses"],
    photos: [],
    freshness: {
      score: 90,
      remainingDaysMin: 3,
      remainingDaysMax: 4,
      confidence: 80,
      signals: [],
    },
    analysis: null,
    neighborhood: "Test",
    pickupMethods: ["meet"],
    status: "active",
    createdAt: "2026-07-01T00:00:00Z",
    soldAt: null,
    distanceKm: null,
    mapPoint: { lat, lng },
  };
}

describe("clusterListings", () => {
  it("keeps nearby points separate at high zoom", () => {
    const items = [
      listing("a", 52.37, 4.89),
      listing("b", 52.3705, 4.8905),
    ];
    const result = clusterListings(items, 15);
    expect(result.every((r) => r.kind === "point")).toBe(true);
    expect(result).toHaveLength(2);
  });

  it("groups nearby points into a flower cluster at low zoom", () => {
    const items = [
      listing("a", 52.37, 4.89),
      listing("b", 52.3702, 4.8902),
      listing("c", 52.3704, 4.8904),
    ];
    const result = clusterListings(items, 11);
    const clusters = result.filter((r) => r.kind === "cluster");
    expect(clusters.length).toBeGreaterThanOrEqual(1);
    if (clusters[0]?.kind === "cluster") {
      expect(clusters[0].count).toBeGreaterThanOrEqual(2);
    }
  });
});
