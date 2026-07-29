import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { config } from "@/lib/config";

/**
 * Refresh the auth session cookie on every matched request (used by proxy.ts).
 * When `baseResponse` is provided (e.g. next-intl redirect), cookies are merged onto it.
 */
export async function updateSession(
  request: NextRequest,
  baseResponse?: NextResponse,
) {
  let response = baseResponse ?? NextResponse.next({ request });

  if (!config.hasSupabase) return response;

  const supabase = createServerClient(config.supabaseUrl, config.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        // Preserve redirects / rewrite headers from next-intl when present.
        if (!baseResponse) {
          response = NextResponse.next({ request });
        }
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Touches the session so expired tokens are refreshed before Route Handlers run.
  await supabase.auth.getUser();
  return response;
}
