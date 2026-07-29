import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const handleI18n = createMiddleware(routing);

/**
 * Next.js 16 Proxy — locale routing (next-intl) + Supabase session refresh.
 * API and auth callback stay outside the locale prefix.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const skipI18n =
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next");

  if (skipI18n) {
    return updateSession(request);
  }

  const intlResponse = handleI18n(request);
  return updateSession(request, intlResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
