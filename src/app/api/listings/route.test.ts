import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type { Listing } from "@/domain/types";
import { createTestRepo } from "@/lib/db/testRepo";
import { GET, POST } from "./route";

const seedListing: Listing = {
  id: "seed-tulips",
  seller: { id: "seller-1", displayName: "Jesse", contact: "@jesse" },
  title: "Bright yellow tulips",
  description: "From the market",
  priceCents: 500,
  currency: "GEL",
  flowerTypes: ["tulips"],
  photos: [{ id: "p1", src: "/api/placeholder/tulips?seed=x", position: 0 }],
  freshness: {
    score: 97,
    remainingDaysMin: 6,
    remainingDaysMax: 8,
    confidence: 88,
    signals: ["tight fresh buds"],
  },
  analysis: null,
  neighborhood: "De Pijp",
  coordinates: { lat: 52.3547, lng: 4.8921 },
  pickupMethods: ["meet"],
  status: "active",
  createdAt: new Date().toISOString(),
  soldAt: null,
};

let testRepo = createTestRepo([seedListing]);

vi.mock("@/lib/db", () => ({
  getRepo: async () => testRepo,
}));

vi.mock("@/lib/auth", () => ({
  AuthError: class AuthError extends Error {
    status = 401 as const;
  },
  getSessionSellerId: async () => "tester",
}));

const validListing = {
  title: "Fresh tulips",
  description: "From the market",
  priceCents: 500,
  currency: "GEL",
  flowerTypes: ["tulips"],
  photos: ["tester/photo-1.jpg"],
  neighborhood: "De Pijp",
  coordinates: { lat: 52.3547, lng: 4.8921 },
  pickupMethods: ["meet"],
  sellerName: "Test",
  sellerContact: "@test",
  freshness: null,
  analysis: null,
};

function getRequest(qs = ""): NextRequest {
  return new NextRequest(`http://localhost/api/listings${qs}`);
}

function postRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/listings", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  testRepo = createTestRepo([seedListing]);
});

describe("GET /api/listings", () => {
  it("returns active listings without coordinates but with mapPoint", async () => {
    const res = await GET(getRequest());
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.listings.length).toBeGreaterThan(0);
    for (const listing of data.listings) {
      expect(listing.status).toBe("active");
      expect(listing.coordinates).toBeUndefined();
      expect(listing.mapPoint).toEqual({
        lat: expect.any(Number),
        lng: expect.any(Number),
      });
    }
  });

  it("computes distance when viewer coordinates are provided", async () => {
    const res = await GET(getRequest("?lat=52.3702&lng=4.8952&sort=distance"));
    const { listings } = await res.json();
    expect(listings[0].distanceKm).toBeTypeOf("number");
    const distances = listings.map((l: { distanceKm: number }) => l.distanceKm);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  it("applies filters", async () => {
    const res = await GET(getRequest("?flowerType=tulips"));
    const { listings } = await res.json();
    for (const l of listings) expect(l.flowerTypes).toContain("tulips");
  });
});

describe("POST /api/listings", () => {
  it("creates a listing and returns it", async () => {
    const res = await POST(postRequest(validListing));
    expect(res.status).toBe(201);
    const { listing } = await res.json();
    expect(listing.title).toBe("Fresh tulips");
    expect(listing.seller.id).toBe("tester");

    const fetched = await GET(getRequest(`?ids=${listing.id}`));
    const data = await fetched.json();
    expect(data.listings[0].id).toBe(listing.id);
  });

  it("rejects invalid payloads", async () => {
    const res = await POST(postRequest({ ...validListing, title: "x", photos: [] }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.issues.length).toBeGreaterThan(0);
  });

  it("rejects data URL photos", async () => {
    const res = await POST(
      postRequest({ ...validListing, photos: ["data:image/jpeg;base64,abc"] }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects photo paths that do not belong to the seller", async () => {
    const res = await POST(
      postRequest({ ...validListing, photos: ["other-user/photo.jpg"] }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects zero price", async () => {
    const res = await POST(postRequest({ ...validListing, priceCents: 0 }));
    expect(res.status).toBe(400);
  });
});
