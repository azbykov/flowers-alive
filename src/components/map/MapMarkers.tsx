"use client";

import type { PublicListing } from "@/domain/types";
import { formatPrice } from "@/domain/format";
import { freshColorHex } from "@/components/listing/freshness";

/** Price pill badge — white bubble with freshness dot + price. */
export function PriceBadge({
  listing,
  active = false,
}: {
  listing: PublicListing;
  active?: boolean;
}) {
  const score = listing.freshness?.score;
  const dot = score != null ? freshColorHex(score) : "#8b8177";

  return (
    <div
      className={`relative cursor-pointer select-none transition-transform ${
        active ? "z-20 scale-105" : "hover:scale-[1.04]"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1.5 shadow-[0_4px_14px_rgba(42,36,30,0.18)] ${
          active ? "border-stem" : "border-white"
        }`}
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: dot }}
          aria-hidden
        />
        <span className="text-[13px] font-bold leading-none text-ink">
          {formatPrice(listing.priceCents, listing.currency)}
        </span>
      </div>
      <div
        className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[7px] border-x-transparent border-t-white drop-shadow-sm"
        aria-hidden
      />
    </div>
  );
}

/** Orange flower cluster with count in the center. */
export function FlowerClusterBadge({ count }: { count: number }) {
  const label = count > 99 ? "99+" : String(count);
  return (
    <div
      className="relative flex h-[52px] w-[52px] cursor-pointer items-center justify-center transition-transform hover:scale-105"
      aria-label={`${count} bouquets`}
    >
      <svg
        viewBox="0 0 52 52"
        className="absolute inset-0 h-full w-full drop-shadow-[0_4px_12px_rgba(192,86,31,0.35)]"
        aria-hidden
      >
        <g fill="#d98324" stroke="#fff" strokeWidth="2.5">
          <circle cx="26" cy="12" r="9" />
          <circle cx="37.5" cy="20" r="9" />
          <circle cx="34" cy="33.5" r="9" />
          <circle cx="18" cy="33.5" r="9" />
          <circle cx="14.5" cy="20" r="9" />
        </g>
        <circle cx="26" cy="26" r="11" fill="#c0561f" stroke="#fff" strokeWidth="2" />
      </svg>
      <span className="relative z-10 font-data text-[14px] font-bold tracking-tight text-white">
        {label}
      </span>
    </div>
  );
}

/** Expanded listing preview on the map (photo + title + price). */
export function ListingMapCard({ listing }: { listing: PublicListing }) {
  const cover = listing.photos[0]?.src;
  const score = listing.freshness?.score;
  const dot = score != null ? freshColorHex(score) : null;

  return (
    <div className="relative w-[168px] cursor-pointer">
      <div className="overflow-hidden rounded-[16px] border border-white bg-white shadow-[0_12px_28px_rgba(42,36,30,0.22)]">
        <div className="relative aspect-[4/3] bg-surface-tint">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Storage URLs
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : null}
          {score != null && dot && (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/92 px-2 py-1 backdrop-blur-[4px]">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: dot }}
                aria-hidden
              />
              <span
                className="font-data text-[10px] font-bold"
                style={{ color: dot }}
              >
                {score}%
              </span>
            </div>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-2 px-2.5 py-2">
          <span className="truncate font-display text-[14px] font-medium leading-tight text-ink">
            {listing.title}
          </span>
          <span className="shrink-0 text-[13px] font-bold text-ink">
            {formatPrice(listing.priceCents, listing.currency)}
          </span>
        </div>
      </div>
      <div
        className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[8px] border-t-[9px] border-x-transparent border-t-white drop-shadow-sm"
        aria-hidden
      />
    </div>
  );
}
