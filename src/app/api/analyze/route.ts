import { NextRequest, NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/domain/validation";
import { analyzeBouquetPhotos } from "@/lib/ai";

// ~4 MB binary per image ≈ 5.4 M base64 chars.
const MAX_IMAGE_CHARS = 5_500_000;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid images" }, { status: 400 });
  }
  if (parsed.data.images.some((img) => img.length > MAX_IMAGE_CHARS)) {
    return NextResponse.json(
      { error: "Image too large — max 4 MB per photo" },
      { status: 413 },
    );
  }

  try {
    const result = await analyzeBouquetPhotos(parsed.data.images);
    return NextResponse.json(result);
  } catch (err) {
    console.error("AI analysis failed", err);
    return NextResponse.json(
      { error: "Analysis unavailable right now — you can still fill in details manually" },
      { status: 502 },
    );
  }
}
