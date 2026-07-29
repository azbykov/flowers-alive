import { describe, expect, it } from "vitest";
import { matchesFilters, searchListings, sortListings, toPublicListing } from "./search";
import type { Listing, PublicListing } from "./types";

function listing(overrides: Partial<Listing>): Listing {
  return {
    id: "l1",
    seller: { id: "u1", displayName: "Test", contact: "@test" },
    title: "Red roses",
    description: "Lovely",
    priceCents: 500,
    currency: "GEL",
    flowerTypes: ["roses"],
    photos: [],
    freshness: {
      score: 90,
      remainingDaysMin: 4,
      remainingDaysMax: 5,
      confidence: 80,
      signals: [],
    },
    analysis: null,
    neighborhood: "Jordaan",
    coordinates: { lat: 52.3739, lng: 4.8809 },
    pickupMethods: ["meet"],
    status: "active",
    createdAt: "2026-07-01T10:00:00Z",
    soldAt: null,
    ...overrides,
  };
}

describe("toPublicListing", () => {
  it("strips precise coordinates and exposes rounded distance", () => {
    const pub = toPublicListing(listing({}), { lat: 52.3702, lng: 4.8952 });
    expect(pub).not.toHaveProperty("coordinates");
    expect(pub.distanceKm).toBeCloseTo(1.1, 1);
    // rounded to 0.1 km so exact position cannot be recovered
    expect((pub.distanceKm! * 10) % 1).toBe(0);
  });

  it("exposes approximate mapPoint instead of exact coordinates", () => {
    const exact = { lat: 52.37391, lng: 4.88094 };
    const pub = toPublicListing(listing({ coordinates: exact }), null);
    expect(pub.mapPoint).toEqual({ lat: 52.374, lng: 4.881 });
    expect(pub.mapPoint).not.toEqual(exact);
  });

  it("returns null distance without viewer location", () => {
    expect(toPublicListing(listing({}), null).distanceKm).toBeNull();
  });
});

describe("matchesFilters", () => {
  it("matches query against title, flowers and neighborhood", () => {
    expect(matchesFilters(listing({}), { query: "roses" })).toBe(true);
    expect(matchesFilters(listing({}), { query: "jordaan" })).toBe(true);
    expect(matchesFilters(listing({}), { query: "tulips" })).toBe(false);
  });

  it("applies price, freshness, flower type and pickup filters", () => {
    expect(matchesFilters(listing({}), { maxPriceCents: 400 })).toBe(false);
    expect(matchesFilters(listing({}), { maxPriceCents: 500 })).toBe(true);
    expect(matchesFilters(listing({}), { minFreshness: 95 })).toBe(false);
    expect(matchesFilters(listing({}), { flowerType: "tulips" })).toBe(false);
    expect(matchesFilters(listing({}), { pickupMethod: "doorstep" })).toBe(false);
    expect(matchesFilters(listing({}), { pickupMethod: "meet" })).toBe(true);
  });
});

describe("searchListings", () => {
  it("excludes sold listings", () => {
    const results = searchListings(
      [listing({}), listing({ id: "l2", status: "sold" })],
      {},
      "newest",
      null,
    );
    expect(results.map((r) => r.id)).toEqual(["l1"]);
  });
});

describe("sortListings", () => {
  const near = toPublicListing(
    listing({ id: "near", priceCents: 900, createdAt: "2026-07-01T00:00:00Z" }),
    { lat: 52.3739, lng: 4.881 },
  );
  const far = toPublicListing(
    listing({
      id: "far",
      coordinates: { lat: 52.39, lng: 4.92 },
      priceCents: 100,
      createdAt: "2026-07-02T00:00:00Z",
      freshness: { score: 99, remainingDaysMin: 6, remainingDaysMax: 7, confidence: 90, signals: [] },
    }),
    { lat: 52.3739, lng: 4.881 },
  );

  it("sorts by each key", () => {
    expect(sortListings([far, near], "distance")[0].id).toBe("near");
    expect(sortListings([near, far], "freshness")[0].id).toBe("far");
    expect(sortListings([near, far], "price")[0].id).toBe("far");
    expect(sortListings([near, far], "newest")[0].id).toBe("far");
  });

  it("sinks unknown distances to the bottom", () => {
    const unknown: PublicListing = { ...near, id: "unknown", distanceKm: null };
    expect(sortListings([unknown, far], "distance").at(-1)!.id).toBe("unknown");
  });
});
