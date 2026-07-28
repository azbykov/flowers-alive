import type {
  Coordinates,
  Listing,
  PublicListing,
  SearchFilters,
  SortKey,
} from "./types";
import { FLOWER_LABELS } from "./types";
import { approximateDistanceKm } from "./geo";

export function toPublicListing(
  listing: Listing,
  viewer: Coordinates | null,
): PublicListing {
  const { coordinates, ...safe } = listing;
  return {
    ...safe,
    distanceKm: viewer ? approximateDistanceKm(viewer, coordinates) : null,
  };
}

export function matchesFilters(listing: Listing, filters: SearchFilters): boolean {
  if (filters.query) {
    const q = filters.query.trim().toLowerCase();
    const haystack = [
      listing.title,
      listing.description,
      listing.neighborhood,
      ...listing.flowerTypes.map((t) => FLOWER_LABELS[t]),
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (filters.flowerType && !listing.flowerTypes.includes(filters.flowerType)) {
    return false;
  }
  if (
    filters.maxPriceCents !== undefined &&
    listing.priceCents > filters.maxPriceCents
  ) {
    return false;
  }
  if (
    filters.minFreshness !== undefined &&
    (listing.freshness?.score ?? 0) < filters.minFreshness
  ) {
    return false;
  }
  if (
    filters.pickupMethod &&
    !listing.pickupMethods.includes(filters.pickupMethod)
  ) {
    return false;
  }
  return true;
}

export function sortListings(
  listings: PublicListing[],
  sort: SortKey,
): PublicListing[] {
  const byNewest = (a: PublicListing, b: PublicListing) =>
    Date.parse(b.createdAt) - Date.parse(a.createdAt);

  const sorted = [...listings];
  switch (sort) {
    case "distance":
      // Unknown distances sink to the bottom; ties break by freshness —
      // distance is the primary ranking signal, freshness the second.
      sorted.sort((a, b) => {
        const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
        const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
        if (da !== db) return da - db;
        return (b.freshness?.score ?? 0) - (a.freshness?.score ?? 0);
      });
      break;
    case "freshness":
      sorted.sort(
        (a, b) => (b.freshness?.score ?? 0) - (a.freshness?.score ?? 0),
      );
      break;
    case "price":
      sorted.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "newest":
      sorted.sort(byNewest);
      break;
  }
  return sorted;
}

export function searchListings(
  listings: Listing[],
  filters: SearchFilters,
  sort: SortKey,
  viewer: Coordinates | null,
): PublicListing[] {
  const visible = listings.filter(
    (l) => l.status === "active" && matchesFilters(l, filters),
  );
  return sortListings(
    visible.map((l) => toPublicListing(l, viewer)),
    sort,
  );
}
