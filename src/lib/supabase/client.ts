"use client";

import { createBrowserClient } from "@supabase/ssr";
import { config } from "@/lib/config";

/** Browser Supabase client — session lives in cookies via @supabase/ssr. */
export function createClient() {
  return createBrowserClient(config.supabaseUrl, config.supabaseAnonKey);
}
