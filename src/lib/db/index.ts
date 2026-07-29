import { config } from "@/lib/config";
import type { ListingRepository } from "./repo";

/**
 * Request-scoped Supabase repo — RLS sees the authenticated user from the
 * session cookie. Requires NEXT_PUBLIC_SUPABASE_* to be configured.
 */
export async function getRepo(): Promise<ListingRepository> {
  if (!config.hasSupabase) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  const { createClient } = await import("@/lib/supabase/server");
  const { createSupabaseRepo } = await import("./supabaseRepo");
  return createSupabaseRepo(await createClient());
}

export type { ListingRepository };
