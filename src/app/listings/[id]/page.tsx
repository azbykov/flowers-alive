"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PublicListing } from "@/domain/types";
import { FLOWER_LABELS, PICKUP_LABELS } from "@/domain/types";
import { formatPrice, timeAgo } from "@/domain/format";
import { distanceLabel } from "@/domain/geo";
import { getViewerLocation } from "@/lib/client/location";
import { useAuthProfile } from "@/lib/client/profile";
import { FreshnessCard } from "@/components/listing/FreshnessCard";
import { FavoriteButton } from "@/components/listing/FavoriteButton";
import { ApproximateMap } from "@/components/map/lazy";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

const AVATAR_COLORS = ["#c2557a", "#d98324", "#6d9a4f", "#7c68ad", "#b23b4e"];

function avatarColor(name: string): string {
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { profile } = useAuthProfile();
  const [listing, setListing] = useState<PublicListing | null | "missing">(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    void (async () => {
      const viewer = await getViewerLocation();
      const res = await fetch(
        `/api/listings/${id}?lat=${viewer.lat}&lng=${viewer.lng}`,
      );
      if (!res.ok) {
        setListing("missing");
        return;
      }
      const data = (await res.json()) as { listing: PublicListing };
      setListing(data.listing);
      const me = profile.id !== "server" ? profile.id : "";
      setIsOwner(Boolean(me) && data.listing.seller.id === me);
    })();
  }, [id, profile.id]);

  async function markSold() {
    if (listing === null || listing === "missing") return;
    setMarking(true);
    const res = await fetch(`/api/listings/${listing.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "markSold" }),
    });
    setMarking(false);
    if (res.ok) {
      const data = (await res.json()) as { listing: PublicListing };
      setListing(data.listing);
    }
  }

  if (listing === null) {
    return (
      <div className="flex justify-center py-24 text-stem">
        <Spinner size={28} />
      </div>
    );
  }
  if (listing === "missing") {
    return (
      <EmptyState
        emoji="🥀"
        message="This bouquet is gone — maybe it already found a home."
        action={
          <Button variant="secondary" onClick={() => router.push("/")}>
            Back to browse
          </Button>
        }
      />
    );
  }

  const sold = listing.status === "sold";
  const seller = listing.seller;
  const sellerName = seller.displayName || "a neighbor";

  const contactAction = isOwner ? (
    <Button fullWidth variant="secondary" loading={marking} onClick={markSold}>
      Mark as sold
    </Button>
  ) : showContact ? (
    <div className="flex-1 rounded-2xl bg-stem-tint px-4 py-3 text-center">
      <span className="text-[13px] text-ink-soft">Reach the seller at </span>
      <span className="font-semibold">{seller.contact}</span>
    </div>
  ) : (
    <Button
      fullWidth
      className="!h-[58px] !rounded-2xl !text-[17px]"
      onClick={() => setShowContact(true)}
    >
      Contact {sellerName}
    </Button>
  );

  return (
    <main className="mx-auto max-w-2xl pb-28 lg:max-w-[1240px] lg:px-8 lg:pb-14">
      <div className="hidden pb-3 pt-6 lg:block">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
        >
          ‹ Back to browse
        </Link>
      </div>

      <div className="lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10">
        {/* Photos — swipe gallery on mobile, sticky selected + thumbs on desktop */}
        <div className="lg:sticky lg:top-24">
          <div className="relative lg:hidden">
            <div className="flex snap-x snap-mandatory overflow-x-auto">
              {listing.photos.map((photo) => (
                // eslint-disable-next-line @next/next/no-img-element -- sources include data URLs
                <img
                  key={photo.id}
                  src={photo.src}
                  alt={listing.title}
                  className="aspect-[4/3] w-full shrink-0 snap-center object-cover"
                />
              ))}
            </div>
            <Link
              href="/"
              aria-label="Back to browse"
              className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 shadow"
            >
              ←
            </Link>
            {sold && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
                <span className="rounded-full bg-card px-5 py-2 font-semibold">Sold</span>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-surface-tint shadow-[0_20px_50px_-24px_rgba(42,36,30,0.35)]">
              {listing.photos[photoIdx] && (
                // eslint-disable-next-line @next/next/no-img-element -- sources include data URLs
                <img
                  src={listing.photos[photoIdx].src}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              )}
              {!sold && (
                <div className="absolute right-4 top-4">
                  <FavoriteButton listingId={listing.id} size="lg" />
                </div>
              )}
              {sold && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
                  <span className="rounded-full bg-card px-5 py-2 font-semibold">Sold</span>
                </div>
              )}
            </div>
            {listing.photos.length > 1 && (
              <div className="mt-3 flex gap-3">
                {listing.photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={() => setPhotoIdx(i)}
                    aria-label={`Photo ${i + 1}`}
                    className={`flex-1 overflow-hidden rounded-[14px] border-2 ${
                      i === photoIdx ? "border-stem" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- data URLs */}
                    <img src={photo.src} alt="" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4 px-4 pt-4 lg:px-0 lg:pt-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-medium leading-[1.1] tracking-tight lg:text-[34px]">
                {listing.title}
              </h1>
              <p className="mt-1.5 text-[13px] text-ink-soft lg:text-[14.5px]">
                {listing.neighborhood}
                {listing.distanceKm !== null &&
                  ` · ${distanceLabel(listing.distanceKm)} away`}
                {" · "}
                {timeAgo(listing.createdAt)}
              </p>
            </div>
            <span className="whitespace-nowrap text-xl font-bold lg:text-[30px]">
              {formatPrice(listing.priceCents, listing.currency)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {listing.flowerTypes.map((type) => (
              <Chip key={type} label={FLOWER_LABELS[type]} />
            ))}
            {listing.pickupMethods.map((method) => (
              <Chip key={method} label={`📍 ${PICKUP_LABELS[method]}`} />
            ))}
          </div>

          {listing.freshness && <FreshnessCard report={listing.freshness} />}

          {listing.description && (
            <div>
              <h2 className="font-display text-[20px] font-medium">From the seller</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
                {listing.description}
              </p>
            </div>
          )}

          <div>
            <h2 className="font-display text-[20px] font-medium">Pickup area</h2>
            <div className="mt-2">
              <ApproximateMap
                mapPoint={listing.mapPoint}
                neighborhood={listing.neighborhood}
              />
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-card p-4">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ background: avatarColor(sellerName) }}
            >
              {sellerName.charAt(0).toUpperCase()}
            </span>
            <div className="flex-1">
              <div className="text-base font-bold">{sellerName}</div>
              <div className="text-[13px] text-ink-soft">
                You arrange pickup together
              </div>
            </div>
          </div>

          {!sold && (
            <div className="hidden gap-3.5 pt-1 lg:flex">{contactAction}</div>
          )}
        </div>
      </div>

      {!sold && (
        <div className="fixed inset-x-0 bottom-16 z-10 border-t border-line bg-card/95 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            {contactAction}
            <FavoriteButton listingId={listing.id} size="lg" />
          </div>
        </div>
      )}
    </main>
  );
}
