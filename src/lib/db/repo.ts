import type { Listing } from "@/domain/types";
import type { CreateListingInput } from "@/domain/validation";

export interface ListingRepository {
  list(): Promise<Listing[]>;
  get(id: string): Promise<Listing | null>;
  getMany(ids: string[]): Promise<Listing[]>;
  create(input: CreateListingInput, sellerId: string): Promise<Listing>;
  /** Only the owning seller may mark a listing sold; returns null otherwise. */
  markSold(id: string, sellerId: string): Promise<Listing | null>;
}
