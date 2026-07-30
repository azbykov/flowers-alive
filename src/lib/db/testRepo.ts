import type { Listing } from "@/domain/types";
import type { CreateListingInput } from "@/domain/validation";
import type { ListingRepository } from "./repo";

/** In-memory repo for unit tests — not used at runtime. */
export function createTestRepo(initial: Listing[] = []): ListingRepository {
  const store = new Map(initial.map((l) => [l.id, l]));

  return {
    async list() {
      return [...store.values()].filter((l) => l.status === "active");
    },

    async get(id) {
      return store.get(id) ?? null;
    },

    async getMany(ids) {
      return ids.map((id) => store.get(id)).filter((l): l is Listing => l != null);
    },

    async create(input: CreateListingInput, sellerId: string) {
      const id = crypto.randomUUID();
      const listing: Listing = {
        id,
        seller: {
          id: sellerId,
          displayName: input.sellerName,
          avatarUrl: "",
          phone: input.sellerPhone,
          telegram: input.sellerTelegram,
          whatsapp: input.sellerWhatsapp,
        },
        title: input.title,
        description: input.description,
        priceCents: input.priceCents,
        currency: input.currency,
        flowerTypes: input.flowerTypes,
        photos: input.photos.map((src, i) => ({
          id: `${id}-p${i}`,
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
      store.set(id, listing);
      return listing;
    },

    async markSold(id, sellerId) {
      const listing = store.get(id);
      if (!listing || listing.seller.id !== sellerId) return null;
      const updated = {
        ...listing,
        status: "sold" as const,
        soldAt: new Date().toISOString(),
      };
      store.set(id, updated);
      return updated;
    },
  };
}
