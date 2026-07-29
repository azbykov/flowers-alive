"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { PublicListing } from "@/domain/types";
import { getFavoriteIds } from "@/lib/client/favorites";
import { getViewerLocation } from "@/lib/client/location";
import { BouquetCard } from "@/components/listing/BouquetCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";

export default function FavoritesPage() {
  const t = useTranslations("Favorites");
  const [listings, setListings] = useState<PublicListing[] | null>(null);

  useEffect(() => {
    void (async () => {
      const ids = getFavoriteIds();
      if (ids.length === 0) {
        setListings([]);
        return;
      }
      const viewer = await getViewerLocation();
      const res = await fetch(
        `/api/listings?ids=${ids.join(",")}&lat=${viewer.lat}&lng=${viewer.lng}`,
      );
      const data = (await res.json()) as { listings: PublicListing[] };
      setListings(data.listings);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-4 pt-6 lg:max-w-[1240px] lg:px-8 lg:pt-10">
      <h1 className="font-display text-2xl font-medium tracking-tight lg:text-[38px]">
        {t("title")}
      </h1>
      {listings !== null && listings.length > 0 && (
        <p className="mt-1 text-sm text-ink-soft">
          {t("watching", { count: listings.length })}
        </p>
      )}
      {listings === null ? (
        <div className="flex justify-center py-20 text-stem">
          <Spinner size={28} />
        </div>
      ) : listings.length === 0 ? (
        <EmptyState emoji="🤍" message={t("empty")} />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 pb-14 min-[400px]:grid-cols-2 md:grid-cols-3 lg:mt-6 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-8">
          {listings.map((listing) => (
            <BouquetCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  );
}
