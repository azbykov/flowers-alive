import { NextRequest, NextResponse } from "next/server";
import { toPublicListing } from "@/domain/search";
import { AuthError, getSessionSellerId } from "@/lib/auth";
import { getRepo } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  const { id } = await context.params;
  const repo = await getRepo();
  const listing = await repo.get(id);
  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));
  const viewer =
    Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  return NextResponse.json({ listing: toPublicListing(listing, viewer) });
}

export async function PATCH(request: NextRequest, context: Context) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (body?.action !== "markSold") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  let sellerId: string;
  try {
    sellerId = await getSessionSellerId(request);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }

  const repo = await getRepo();
  const listing = await repo.markSold(id, sellerId);
  if (!listing) {
    return NextResponse.json(
      { error: "Not found or not yours" },
      { status: 404 },
    );
  }
  return NextResponse.json({ listing: toPublicListing(listing, null) });
}
