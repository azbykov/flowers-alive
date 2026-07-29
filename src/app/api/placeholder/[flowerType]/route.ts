import type { NextRequest } from "next/server";
import { FLOWER_TYPES } from "@/domain/types";
import { renderBouquetSvg } from "@/lib/placeholder/renderBouquetSvg";

type Context = { params: Promise<{ flowerType: string }> };

/**
 * On-demand bouquet SVG placeholder (fallback when a listing has no real photo).
 * Local seed listings use Storage paths `seed/*.jpg` (see `npm run seed:storage`).
 * `?seed=` picks the variant (shape layout + colors); pass a stable id
 * (e.g. the listing id) so the image never changes.
 */
export async function GET(request: NextRequest, context: Context) {
  const { flowerType: raw } = await context.params;
  const flowerType = FLOWER_TYPES.includes(raw as never) ? (raw as (typeof FLOWER_TYPES)[number]) : "other";
  const seed = request.nextUrl.searchParams.get("seed") ?? flowerType;
  const color = request.nextUrl.searchParams.get("color") ?? undefined;

  const svg = renderBouquetSvg(flowerType, seed, color);
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
