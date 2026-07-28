import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { config } from "@/lib/config";

/**
 * Request-scoped Supabase client. Cookie-backed session means RLS sees
 * auth.uid() for the calling user — no service-role key needed.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — cookie writes are ignored;
          // proxy.ts refreshes the session on the next request.
        }
      },
    },
  });
}
