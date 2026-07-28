import { NextRequest } from "next/server";
import { config } from "@/lib/config";

export class AuthError extends Error {
  status = 401 as const;
  constructor(message = "Not authorized") {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Resolve the seller id for a mutating request.
 * Production: Supabase session user id (cookie). Demo: x-seller-id header.
 */
export async function getSessionSellerId(request: NextRequest): Promise<string> {
  if (config.demoMode) {
    return request.headers.get("x-seller-id") ?? "anonymous";
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new AuthError();
  return user.id;
}
