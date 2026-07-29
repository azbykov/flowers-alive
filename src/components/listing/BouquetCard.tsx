"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { PublicListing } from "@/domain/types";
import { formatPrice } from "@/domain/format";
import { remainingDaysLabel } from "@/domain/freshness";
import { distanceLabel } from "@/domain/geo";
import { toggleFavorite, useFavorite } from "@/lib/client/favorites";
import { freshColor } from "./freshness";

/**
 * Core marketplace unit, ported from design/handoff BouquetCard.dc.html.
 * Fills its column, so the same component serves single-column feeds and
 * 2-column grids.
 */

export function BouquetCard({ listing }: { listing: PublicListing }) {
  const t = useTranslations("Card");
  const locale = useLocale();
  const faved = useFavorite(listing.id);

  const cover = listing.photos[0];
  const sold = listing.status === "sold";
  const fresh = listing.freshness;
  const color = fresh ? freshColor(fresh.score) : "var(--muted)";

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex cursor-pointer flex-col gap-2.5 font-ui"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface-tint shadow-[0_1px_2px_rgba(42,36,30,0.06)]">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element -- sources include data URLs from uploads
          <img
            src={cover.src}
            alt={listing.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
        {sold ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-warm/40">
            <span className="rounded-full bg-card px-4 py-1.5 text-[13px] font-semibold text-ink-warm">
              {t("sold")}
            </span>
          </div>
        ) : (
          <>
            {fresh && (
              <div className="absolute left-2.5 top-2.5 flex items-center gap-[5px] rounded-full bg-white/[.92] px-[9px] py-[5px] backdrop-blur-[4px]">
                <span
                  className="h-[7px] w-[7px] rounded-full"
                  style={{ background: color }}
                />
                <span
                  className="font-data text-[11px] font-bold tracking-[-0.3px]"
                  style={{ color }}
                >
                  {fresh.score}%
                </span>
              </div>
            )}
            <button
              type="button"
              aria-label={faved ? t("removeFavorite") : t("saveFavorite")}
              aria-pressed={faved}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(listing.id);
              }}
              className="absolute right-2 top-2 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/[.92] text-base leading-none backdrop-blur-[4px] transition-transform active:scale-90"
            >
              {faved ? (
                <span className="text-like" aria-hidden>
                  ❤
                </span>
              ) : (
                <span className="text-faint" aria-hidden>
                  ♡
                </span>
              )}
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-[3px]">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-display text-[17px] font-medium leading-[1.2] text-ink-warm">
            {listing.title}
          </span>
          <span className="whitespace-nowrap text-[15px] font-bold text-ink-warm">
            {formatPrice(listing.priceCents, locale, listing.currency)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[12.5px] text-muted">
          <span>{listing.neighborhood}</span>
          {listing.distanceKm !== null && (
            <>
              <span className="h-[3px] w-[3px] rounded-full bg-sep" />
              <span>{distanceLabel(listing.distanceKm, locale)}</span>
            </>
          )}
          {fresh && !sold && (
            <>
              <span className="h-[3px] w-[3px] rounded-full bg-sep" />
              <span style={{ color }}>{remainingDaysLabel(fresh, locale)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
