import { randomUUID } from "node:crypto";
import type { Listing } from "@/domain/types";
import type { CreateListingInput } from "@/domain/validation";
import type { ListingRepository } from "./repo";
import { seedListings } from "./seed";

/**
 * Demo-mode repository. Survives Next.js dev hot-reloads via globalThis.
 * Data resets on server restart — by design for the demo.
 */
const store = globalThis as unknown as { __listings?: Map<string, Listing> };

function db(): Map<string, Listing> {
  if (!store.__listings) {
    store.__listings = new Map(seedListings().map((l) => [l.id, l]));
  }
  return store.__listings;
}

export const memoryRepo: ListingRepository = {
  async list() {
    return [...db().values()];
  },

  async get(id) {
    return db().get(id) ?? null;
  },

  async getMany(ids) {
    const set = new Set(ids);
    return [...db().values()].filter((l) => set.has(l.id));
  },

  async create(input: CreateListingInput, sellerId: string) {
    const listing: Listing = {
      id: randomUUID(),
      seller: {
        id: sellerId,
        displayName: input.sellerName,
        contact: input.sellerContact,
      },
      title: input.title,
      description: input.description,
      priceCents: input.priceCents,
      currency: input.currency,
      flowerTypes: input.flowerTypes,
      photos: input.photos.map((src, i) => ({
        id: `photo-${i}`,
        src,
        position: i,
      })),
      freshness: input.freshness,
      analysis: input.analysis,
      neighborhood: input.neighborhood,
      coordinates: input.coordinates,
      pickupMethods: input.pickupMethods,
      status: "active",
      createdAt: new Date().toISOString(),
      soldAt: null,
    };
    db().set(listing.id, listing);
    return listing;
  },

  async markSold(id, sellerId) {
    const listing = db().get(id);
    if (!listing || listing.seller.id !== sellerId) return null;
    if (listing.status === "sold") return listing;
    const updated: Listing = {
      ...listing,
      status: "sold",
      soldAt: new Date().toISOString(),
    };
    db().set(id, updated);
    return updated;
  },
};
