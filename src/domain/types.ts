export const FLOWER_TYPES = [
  "roses",
  "tulips",
  "peonies",
  "lilies",
  "chrysanthemums",
  "hydrangeas",
  "sunflowers",
  "mixed",
  "other",
] as const;
export type FlowerType = (typeof FLOWER_TYPES)[number];

export const PICKUP_METHODS = ["meet", "doorstep", "pickup_point"] as const;
export type PickupMethod = (typeof PICKUP_METHODS)[number];

export const QUALITY_RATINGS = ["excellent", "good", "average", "poor"] as const;
export type QualityRating = (typeof QUALITY_RATINGS)[number];

export type ListingStatus = "active" | "sold" | "expired";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Photo {
  id: string;
  /** URL or data URL; in production a Supabase Storage public URL. */
  src: string;
  position: number;
}

export interface FreshnessReport {
  /** 0–100 */
  score: number;
  remainingDaysMin: number;
  remainingDaysMax: number;
  /** 0–100 — always shown; freshness is never presented as certainty. */
  confidence: number;
  /** Human-readable explanation bullets, e.g. "healthy petals". */
  signals: string[];
}

export interface IdentifiedFlower {
  type: FlowerType;
  name: string;
  count?: number;
}

export interface BouquetAnalysis {
  flowers: IdentifiedFlower[];
  colorPalette: string[];
  damageNotes: string[];
  suggestedTitle: string;
  suggestedDescription: string;
  photoQuality: QualityRating;
  listingQuality: QualityRating;
  /** Constructive suggestions, e.g. "Improve lighting". */
  suggestions: string[];
}

export interface Seller {
  id: string;
  displayName: string;
  /** Google / OAuth picture when available; empty otherwise. */
  avatarUrl: string;
  /** Revealed only when a buyer taps "Contact seller". */
  phone: string;
  /** Telegram username without @. */
  telegram: string;
  /** Phone number used for WhatsApp (wa.me). */
  whatsapp: string;
}

export interface Listing {
  id: string;
  seller: Seller;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  flowerTypes: FlowerType[];
  photos: Photo[];
  freshness: FreshnessReport | null;
  analysis: BouquetAnalysis | null;
  neighborhood: string;
  /** Internal only — never expose through the public API. */
  coordinates: Coordinates;
  pickupMethods: PickupMethod[];
  status: ListingStatus;
  createdAt: string; // ISO
  soldAt: string | null;
}

/**
 * Listing as exposed publicly: exact coordinates stripped.
 * `mapPoint` is a ~100 m grid snap for browse/detail maps only.
 */
export type PublicListing = Omit<Listing, "coordinates"> & {
  distanceKm: number | null;
  mapPoint: Coordinates;
};

export type SortKey = "distance" | "freshness" | "newest" | "price";

export interface SearchFilters {
  query?: string;
  flowerType?: FlowerType;
  maxPriceCents?: number;
  minFreshness?: number;
  pickupMethod?: PickupMethod;
}

export const FLOWER_LABELS: Record<FlowerType, string> = {
  roses: "Roses",
  tulips: "Tulips",
  peonies: "Peonies",
  lilies: "Lilies",
  chrysanthemums: "Chrysanthemums",
  hydrangeas: "Hydrangeas",
  sunflowers: "Sunflowers",
  mixed: "Mixed bouquet",
  other: "Other",
};

export const PICKUP_LABELS: Record<PickupMethod, string> = {
  meet: "Meet in person",
  doorstep: "Doorstep pickup",
  pickup_point: "Pickup point",
};
