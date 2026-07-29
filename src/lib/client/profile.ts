"use client";

import { useCallback, useEffect, useState } from "react";
import { config } from "@/lib/config";

/** Identity + editable profile from Supabase Auth + profiles table. */

export interface Profile {
  id: string;
  displayName: string;
  contact: string;
}

const CHANGE_EVENT = "slf:profile-changed";
const SERVER_SNAPSHOT: Profile = { id: "server", displayName: "", contact: "" };

let cache: Profile | null = null;

export function getProfile(): Profile {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  return cache ?? SERVER_SNAPSHOT;
}

export function saveProfile(
  update: Pick<Profile, "displayName" | "contact">,
): Profile {
  const current = cache ?? SERVER_SNAPSHOT;
  const next = { ...current, ...update };
  cache = next;
  window.dispatchEvent(new Event(CHANGE_EVENT));
  void persistProfileToSupabase(next);
  return next;
}

async function persistProfileToSupabase(profile: Profile) {
  if (!profile.id || profile.id === "server") return;
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  await supabase.from("profiles").upsert({
    id: profile.id,
    display_name: profile.displayName,
    contact: profile.contact,
  });
}

/**
 * Auth profile: loads the Supabase session + profiles row.
 * Without Supabase config, always unsigned-out.
 */
export function useAuthProfile(): {
  profile: Profile;
  loading: boolean;
  signedIn: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
} {
  const [authState, setAuthState] = useState<{
    profile: Profile;
    loading: boolean;
    signedIn: boolean;
  }>(() =>
    config.hasSupabase
      ? { profile: SERVER_SNAPSHOT, loading: true, signedIn: false }
      : { profile: SERVER_SNAPSHOT, loading: false, signedIn: false },
  );

  const refresh = useCallback(async () => {
    if (!config.hasSupabase) {
      cache = SERVER_SNAPSHOT;
      setAuthState({
        profile: SERVER_SNAPSHOT,
        loading: false,
        signedIn: false,
      });
      return;
    }
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      cache = SERVER_SNAPSHOT;
      setAuthState({
        profile: SERVER_SNAPSHOT,
        loading: false,
        signedIn: false,
      });
      return;
    }
    const { data: row } = await supabase
      .from("profiles")
      .select("display_name, contact")
      .eq("id", user.id)
      .maybeSingle();
    const metadataName =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      "";
    const next: Profile = {
      id: user.id,
      displayName: row?.display_name ?? metadataName,
      contact: row?.contact ?? "",
    };
    if (!row && metadataName) {
      await supabase.from("profiles").upsert({
        id: user.id,
        display_name: metadataName,
      });
    }
    cache = next;
    setAuthState({ profile: next, loading: false, signedIn: true });
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  useEffect(() => {
    if (!config.hasSupabase) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    if (!config.hasSupabase) return;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    cache = SERVER_SNAPSHOT;
    setAuthState({
      profile: SERVER_SNAPSHOT,
      loading: false,
      signedIn: false,
    });
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return {
    profile: authState.profile,
    loading: authState.loading,
    signedIn: authState.signedIn,
    signOut,
    refresh,
  };
}
