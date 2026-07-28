import { config } from "@/lib/config";
import type { ListingRepository } from "./repo";
import { memoryRepo } from "./memoryRepo";

/**
 * Demo mode → in-memory. Production → request-scoped Supabase client so
 * RLS sees the authenticated user from the session cookie.
 */
export async function getRepo(): Promise<ListingRepository> {
  if (config.hasSupabase) {
    const { createClient } = await import("@/lib/supabase/server");
    const { createSupabaseRepo } = await import("./supabaseRepo");
    return createSupabaseRepo(await createClient());
  }
  return memoryRepo;
}

export type { ListingRepository };
