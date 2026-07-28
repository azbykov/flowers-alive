import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

const validListing = {
  title: "Fresh tulips",
  description: "From the market",
  priceCents: 500,
  currency: "EUR",
  flowerTypes: ["tulips"],
  photos: ["data:image/jpeg;base64,abc"],
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
    headers: { "content-type": "application/json", "x-seller-id": "tester" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/listings", () => {
  it("returns active listings without coordinates", async () => {
    const res = await GET(getRequest());
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.listings.length).toBeGreaterThan(0);
    for (const listing of data.listings) {
      expect(listing.status).toBe("active");
      expect(listing.coordinates).toBeUndefined();
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
});
