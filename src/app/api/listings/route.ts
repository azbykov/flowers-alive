import { NextRequest, NextResponse } from "next/server";
import { searchListings, toPublicListing } from "@/domain/search";
import type { Coordinates, SearchFilters, SortKey } from "@/domain/types";
import { FLOWER_TYPES, PICKUP_METHODS } from "@/domain/types";
import { createListingSchema } from "@/domain/validation";
import { AuthError, getSessionSellerId } from "@/lib/auth";
import { getRepo } from "@/lib/db";

function viewerFrom(params: URLSearchParams): Coordinates | null {
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const repo = await getRepo();
  const viewer = viewerFrom(params);

  // Favorites: fetch specific ids, sold ones included so the UI can overlay "Sold".
  const idsParam = params.get("ids");
  if (idsParam !== null) {
    const ids = idsParam.split(",").filter(Boolean).slice(0, 100);
    const listings = await repo.getMany(ids);
    return NextResponse.json({
      listings: listings.map((l) => toPublicListing(l, viewer)),
    });
  }

  // "My listings": everything by one seller, any status.
  const sellerId = params.get("sellerId");
  if (sellerId) {
    const listings = (await repo.list()).filter((l) => l.seller.id === sellerId);
    return NextResponse.json({
      listings: listings.map((l) => toPublicListing(l, viewer)),
    });
  }

  const flowerType = params.get("flowerType");
  const pickupMethod = params.get("pickup");
  const filters: SearchFilters = {
    query: params.get("q") ?? undefined,
    flowerType: FLOWER_TYPES.includes(flowerType as never)
      ? (flowerType as SearchFilters["flowerType"])
      : undefined,
    maxPriceCents: params.get("maxPrice")
      ? Math.round(Number(params.get("maxPrice")) * 100)
      : undefined,
    minFreshness: params.get("minFreshness")
      ? Number(params.get("minFreshness"))
      : undefined,
    pickupMethod: PICKUP_METHODS.includes(pickupMethod as never)
      ? (pickupMethod as SearchFilters["pickupMethod"])
      : undefined,
  };
  const sortParam = params.get("sort");
  const sort: SortKey = ["distance", "freshness", "newest", "price"].includes(
    sortParam ?? "",
  )
    ? (sortParam as SortKey)
    : viewer
      ? "distance"
      : "newest";

  const listings = searchListings(await repo.list(), filters, sort, viewer);
  return NextResponse.json({ listings });
}

export async function POST(request: NextRequest) {
  let sellerId: string;
  try {
    sellerId = await getSessionSellerId(request);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }

  const body = await request.json().catch(() => null);
  const parsed = createListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid listing", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  for (const photo of parsed.data.photos) {
    if (
      photo.startsWith("data:") ||
      photo.startsWith("http://") ||
      photo.startsWith("https://") ||
      photo.startsWith("/")
    ) {
      return NextResponse.json(
        {
          error: "Invalid listing",
          issues: [{ message: "Photos must be uploaded to storage before publishing." }],
        },
        { status: 400 },
      );
    }
    if (!photo.startsWith(`${sellerId}/`)) {
      return NextResponse.json(
        {
          error: "Invalid listing",
          issues: [{ message: "Photo paths must belong to your account." }],
        },
        { status: 400 },
      );
    }
  }

  const repo = await getRepo();
  const listing = await repo.create(parsed.data, sellerId);
  return NextResponse.json(
    { listing: toPublicListing(listing, null) },
    { status: 201 },
  );
}
