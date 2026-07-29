"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type {
  Coordinates,
  FlowerType,
  PickupMethod,
  PublicListing,
  SortKey,
} from "@/domain/types";
import { FLOWER_LABELS, FLOWER_TYPES, PICKUP_LABELS, PICKUP_METHODS } from "@/domain/types";
import { getViewerLocation } from "@/lib/client/location";
import { BouquetCard } from "@/components/listing/BouquetCard";
import { BrowseMap } from "@/components/map/lazy";
import { Chip } from "@/components/ui/Chip";
import { Select, TextInput } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

type BrowseView = "list" | "map";

const VIEW_STORAGE_KEY = "slf-browse-view";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "distance", label: "Distance" },
  { value: "freshness", label: "Freshness" },
  { value: "newest", label: "Newest" },
  { value: "price", label: "Price" },
];

function SortModal({
  sort,
  onPick,
  onClose,
}: {
  sort: SortKey;
  onPick: (s: SortKey) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-[rgba(28,24,21,0.4)] p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[380px] animate-[slfrise_.2s_ease-out] rounded-[20px] bg-surface px-6 pb-4 pt-5 shadow-[0_30px_70px_-20px_rgba(42,36,30,0.4)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Sort by"
      >
        <div className="mb-3 font-display text-[21px] text-ink">Sort by</div>
        {SORT_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => onPick(o.value)}
            className="flex w-full items-center justify-between border-b border-hairline px-1 py-[15px]"
          >
            <span
              className={`text-[15.5px] text-ink ${sort === o.value ? "font-bold" : "font-medium"}`}
            >
              {o.label}
            </span>
            {sort === o.value && (
              <span className="text-lg text-stem" aria-hidden>
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: BrowseView;
  onChange: (v: BrowseView) => void;
}) {
  return (
    <div
      className="inline-flex h-11 shrink-0 rounded-xl border border-line bg-card p-1"
      role="group"
      aria-label="Browse view"
    >
      {(["list", "map"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={view === option}
          className={`rounded-lg px-3.5 text-sm font-bold capitalize transition-colors ${
            view === option
              ? "bg-stem-tint text-stem-deep"
              : "text-ink-2 hover:text-ink"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default function BrowsePage() {
  const [viewer, setViewer] = useState<Coordinates | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("distance");
  const [showSort, setShowSort] = useState(false);
  const [flowerType, setFlowerType] = useState<FlowerType | null>(null);
  const [pickup, setPickup] = useState<PickupMethod | null>(null);
  const [freshOnly, setFreshOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [listings, setListings] = useState<PublicListing[] | null>(null);
  const [view, setView] = useState<BrowseView>("list");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    void getViewerLocation().then(setViewer);
  }, []);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(VIEW_STORAGE_KEY);
      if (stored === "list" || stored === "map") setView(stored);
    } catch {
      /* ignore */
    }
  }, []);

  function changeView(next: BrowseView) {
    setView(next);
    try {
      sessionStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const load = useCallback(async () => {
    const params = new URLSearchParams({ sort });
    if (viewer) {
      params.set("lat", String(viewer.lat));
      params.set("lng", String(viewer.lng));
    }
    if (query.trim()) params.set("q", query.trim());
    if (flowerType) params.set("flowerType", flowerType);
    if (pickup) params.set("pickup", pickup);
    if (freshOnly) params.set("minFreshness", "80");
    if (maxPrice !== null) params.set("maxPrice", String(maxPrice));
    const res = await fetch(`/api/listings?${params}`);
    const data = (await res.json()) as { listings: PublicListing[] };
    setListings(data.listings);
  }, [viewer, query, sort, flowerType, pickup, freshOnly, maxPrice]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void load(), query ? 250 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [load, query]);

  const searching = query.trim().length > 0;
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Distance";

  return (
    <main className="mx-auto max-w-2xl px-4 pt-6 lg:max-w-[1240px] lg:px-8 lg:pt-0">
      {/* Mobile header */}
      <header className="lg:hidden">
        <h1 className="font-display text-2xl font-medium tracking-tight">
          Second Life Flowers
        </h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Fresh bouquets looking for a new home near you
        </p>
      </header>

      {/* Desktop header */}
      <div className="hidden flex-wrap items-end justify-between gap-6 pb-6 pt-10 lg:flex">
        <div>
          <div className="text-[13px] font-semibold text-ink-soft">
            {searching ? "Search results" : "Nearby"}
          </div>
          <h1 className="mt-1 font-display text-[38px] font-medium leading-[1.05] text-ink">
            {searching ? "Bouquets near you" : "Fresh today"}
          </h1>
        </div>
        <div className="flex items-center gap-5">
          {listings !== null && (
            <span className="text-sm text-ink-soft">
              {listings.length} bouquets nearby
            </span>
          )}
          <ViewToggle view={view} onChange={changeView} />
          <button
            onClick={() => setShowSort(true)}
            className="flex h-11 items-center gap-2 rounded-xl border border-line bg-card px-4 text-sm font-bold text-ink"
          >
            Sort: {sortLabel} <span className="text-faint">▾</span>
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 lg:mt-0 lg:max-w-none">
        <div className="min-w-0 flex-1 lg:max-w-[420px]">
          <TextInput
            type="search"
            placeholder="Search roses, tulips, neighborhoods…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search bouquets"
          />
        </div>
        <div className="lg:hidden">
          <ViewToggle view={view} onChange={changeView} />
        </div>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:gap-2.5 lg:pb-7 lg:pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort listings"
          className="!h-9 !w-auto shrink-0 rounded-full !px-3 text-[13px] lg:hidden"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Chip
          label="Fresh 80%+"
          selected={freshOnly}
          onClick={() => setFreshOnly((v) => !v)}
        />
        <Chip
          label="Under €7"
          selected={maxPrice !== null}
          onClick={() => setMaxPrice((v) => (v === null ? 7 : null))}
        />
        {PICKUP_METHODS.map((method) => (
          <Chip
            key={method}
            label={PICKUP_LABELS[method]}
            selected={pickup === method}
            onClick={() => setPickup((v) => (v === method ? null : method))}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:mt-0 lg:flex-wrap lg:gap-2.5 lg:pb-7 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FLOWER_TYPES.filter((t) => t !== "other").map((type) => (
          <Chip
            key={type}
            label={FLOWER_LABELS[type]}
            selected={flowerType === type}
            onClick={() => setFlowerType((v) => (v === type ? null : type))}
          />
        ))}
      </div>

      {listings === null ? (
        <div className="flex justify-center py-20 text-stem">
          <Spinner size={28} />
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          message="No bouquets nearby yet — be the first to share one."
          action={
            <Link href="/sell">
              <Button>Sell a bouquet</Button>
            </Link>
          }
        />
      ) : view === "map" ? (
        <div className="mt-4 pb-14 lg:mt-0">
          <BrowseMap listings={listings} center={viewer} />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 pb-14 min-[400px]:grid-cols-2 md:grid-cols-3 lg:mt-0 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-8">
          {listings.map((listing) => (
            <BouquetCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {showSort && (
        <SortModal
          sort={sort}
          onPick={(s) => {
            setSort(s);
            setShowSort(false);
          }}
          onClose={() => setShowSort(false)}
        />
      )}
    </main>
  );
}
