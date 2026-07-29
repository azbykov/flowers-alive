import { NextRequest, NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/geocode/nominatim";

/** Reverse-geocode GPS coordinates to a public neighborhood label (Nominatim). */
export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const neighborhood = await reverseGeocode(lat, lng);
    return NextResponse.json({ neighborhood, lat, lng });
  } catch {
    return NextResponse.json(
      { error: "Could not resolve your area — try again in a moment." },
      { status: 502 },
    );
  }
}
