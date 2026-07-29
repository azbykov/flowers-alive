import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BouquetAnalysis,
  FlowerType,
  Listing,
  PickupMethod,
} from "@/domain/types";
import type { CreateListingInput } from "@/domain/validation";
import { config } from "@/lib/config";
import type { ListingRepository } from "./repo";

/**
 * Production repository backed by Supabase Postgres.
 * Photo files are uploaded to Supabase Storage by the client before listing
 * creation; `input.photos` then contains storage object paths (or public URLs).
 * The client is request-scoped so RLS sees auth.uid().
 */

const LISTING_SELECT = `
  id, title, description, price_cents, currency, pickup_methods, status,
  created_at, sold_at,
  profiles:seller_id ( id, display_name, contact ),
  locations:location_id ( neighborhood, lat, lng ),
  photos ( id, storage_path, position ),
  bouquets (
    flower_types,
    bouquet_analyses ( flowers, damage_notes, photo_quality, listing_quality, suggestions ),
    freshness_reports ( score, remaining_days_min, remaining_days_max, confidence, signals )
  )
`;

function publicPhotoUrl(storagePath: string): string {
  // Already a full URL, data URL, or app-public path (seed SVGs) — pass through.
  if (
    storagePath.startsWith("http://") ||
    storagePath.startsWith("https://") ||
    storagePath.startsWith("data:") ||
    storagePath.startsWith("/")
  ) {
    return storagePath;
  }
  return `${config.supabaseUrl}/storage/v1/object/public/listing-photos/${storagePath}`;
}

/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase nested selects are untyped without codegen */
function rowToListing(row: any): Listing {
  const bouquet = Array.isArray(row.bouquets) ? row.bouquets[0] : row.bouquets;
  const analysis = bouquet?.bouquet_analyses?.[0] ?? bouquet?.bouquet_analyses;
  const fresh = bouquet?.freshness_reports?.[0] ?? bouquet?.freshness_reports;
  return {
    id: row.id,
    seller: {
      id: row.profiles.id,
      displayName: row.profiles.display_name,
      contact: row.profiles.contact,
    },
    title: row.title,
    description: row.description,
    priceCents: row.price_cents,
    currency: row.currency,
    flowerTypes: (bouquet?.flower_types ?? []) as FlowerType[],
    photos: (row.photos ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((p: any) => ({
        id: p.id,
        src: publicPhotoUrl(p.storage_path),
        position: p.position,
      })),
    freshness: fresh
      ? {
          score: fresh.score,
          remainingDaysMin: fresh.remaining_days_min,
          remainingDaysMax: fresh.remaining_days_max,
          confidence: fresh.confidence,
          signals: fresh.signals ?? [],
        }
      : null,
    analysis: analysis
      ? ({
          flowers: analysis.flowers ?? [],
          colorPalette: [],
          damageNotes: analysis.damage_notes ?? [],
          suggestedTitle: "",
          suggestedDescription: "",
          photoQuality: analysis.photo_quality,
          listingQuality: analysis.listing_quality,
          suggestions: analysis.suggestions ?? [],
        } as BouquetAnalysis)
      : null,
    neighborhood: row.locations.neighborhood,
    coordinates: { lat: row.locations.lat, lng: row.locations.lng },
    pickupMethods: (row.pickup_methods ?? []) as PickupMethod[],
    status: row.status,
    createdAt: row.created_at,
    soldAt: row.sold_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function createSupabaseRepo(sb: SupabaseClient): ListingRepository {
  const repo: ListingRepository = {
    async list() {
      const { data, error } = await sb
        .from("listings")
        .select(LISTING_SELECT)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []).map(rowToListing);
    },

    async get(id) {
      const { data, error } = await sb
        .from("listings")
        .select(LISTING_SELECT)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToListing(data) : null;
    },

    async getMany(ids) {
      if (ids.length === 0) return [];
      const { data, error } = await sb
        .from("listings")
        .select(LISTING_SELECT)
        .in("id", ids);
      if (error) throw error;
      return (data ?? []).map(rowToListing);
    },

    async create(input: CreateListingInput, sellerId: string) {
      // Ensure the profile row exists (first publish after magic-link sign-in).
      const { error: profileErr } = await sb.from("profiles").upsert(
        {
          id: sellerId,
          display_name: input.sellerName,
          contact: input.sellerContact,
        },
        { onConflict: "id" },
      );
      if (profileErr) throw profileErr;

      const { data: location, error: locErr } = await sb
        .from("locations")
        .insert({
          neighborhood: input.neighborhood,
          lat: input.coordinates.lat,
          lng: input.coordinates.lng,
          created_by: sellerId,
        })
        .select("id")
        .single();
      if (locErr) throw locErr;

      const { data: listing, error: listErr } = await sb
        .from("listings")
        .insert({
          seller_id: sellerId,
          location_id: location.id,
          title: input.title,
          description: input.description,
          price_cents: input.priceCents,
          currency: input.currency,
          pickup_methods: input.pickupMethods,
        })
        .select("id")
        .single();
      if (listErr) throw listErr;

      const { data: bouquet, error: bqErr } = await sb
        .from("bouquets")
        .insert({
          listing_id: listing.id,
          flower_types: input.flowerTypes,
          color_palette: input.analysis?.colorPalette ?? [],
        })
        .select("id")
        .single();
      if (bqErr) throw bqErr;

      const inserts: PromiseLike<{ error: unknown }>[] = [
        sb.from("photos").insert(
          input.photos.map((src, i) => ({
            listing_id: listing.id,
            storage_path: src,
            position: i,
          })),
        ),
        sb.from("listing_history").insert({
          listing_id: listing.id,
          event: "created",
        }),
      ];
      if (input.freshness) {
        inserts.push(
          sb.from("freshness_reports").insert({
            bouquet_id: bouquet.id,
            score: input.freshness.score,
            remaining_days_min: input.freshness.remainingDaysMin,
            remaining_days_max: input.freshness.remainingDaysMax,
            confidence: input.freshness.confidence,
            signals: input.freshness.signals,
          }),
        );
      }
      if (input.analysis) {
        inserts.push(
          sb.from("bouquet_analyses").insert({
            bouquet_id: bouquet.id,
            model: "openai",
            flowers: input.analysis.flowers,
            damage_notes: input.analysis.damageNotes,
            photo_quality: input.analysis.photoQuality,
            listing_quality: input.analysis.listingQuality,
            suggestions: input.analysis.suggestions,
          }),
        );
      }
      for (const result of await Promise.all(inserts)) {
        if (result.error) throw result.error;
      }

      const created = await repo.get(listing.id);
      if (!created) throw new Error("Listing vanished after creation");
      return created;
    },

    async markSold(id, sellerId) {
      const { error } = await sb
        .from("listings")
        .update({ status: "sold", sold_at: new Date().toISOString() })
        .eq("id", id)
        .eq("seller_id", sellerId);
      if (error) throw error;
      return repo.get(id);
    },
  };

  return repo;
}
