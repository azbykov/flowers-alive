import { NextRequest } from "next/server";

export class AuthError extends Error {
  status = 401 as const;
  constructor(message = "Not authorized") {
    super(message);
    this.name = "AuthError";
  }
}

/** Resolve the seller id for a mutating request from the Supabase session cookie. */
export async function getSessionSellerId(_request?: NextRequest): Promise<string> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new AuthError();
  return user.id;
}
