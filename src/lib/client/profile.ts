"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { config } from "@/lib/config";

/**
 * Identity + editable profile.
 * Demo mode: stable anonymous id in localStorage.
 * Production: Supabase Auth user id + profiles table.
 */

export interface Profile {
  id: string;
  displayName: string;
  contact: string;
}

const KEY = "slf.profile";
const CHANGE_EVENT = "slf:profile-changed";
const SERVER_SNAPSHOT: Profile = { id: "server", displayName: "", contact: "" };

let cache: Profile | null = null;

function readDemo(): Profile {
  const raw = window.localStorage.getItem(KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Profile;
    } catch {
      // fall through to re-create
    }
  }
  const fresh: Profile = {
    id: crypto.randomUUID(),
    displayName: "",
    contact: "",
  };
  window.localStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}

export function getProfile(): Profile {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  if (config.hasSupabase) {
    // Production callers should prefer useAuthProfile(); this fallback
    // keeps sell-flow publish working until the auth profile has loaded.
    return cache ?? SERVER_SNAPSHOT;
  }
  cache ??= readDemo();
  return cache;
}

export function saveProfile(
  update: Pick<Profile, "displayName" | "contact">,
): Profile {
  if (config.hasSupabase) {
    const current = cache ?? SERVER_SNAPSHOT;
    const next = { ...current, ...update };
    cache = next;
    window.dispatchEvent(new Event(CHANGE_EVENT));
    void persistProfileToSupabase(next);
    return next;
  }
  const profile = { ...getProfile(), ...update };
  window.localStorage.setItem(KEY, JSON.stringify(profile));
  cache = profile;
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return profile;
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

function subscribe(onChange: () => void): () => void {
  const handler = () => {
    if (!config.hasSupabase) cache = null;
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

/** Reactive stored profile — hydration-safe (empty on the server pass). */
export function useStoredProfile(): Profile {
  return useSyncExternalStore(subscribe, getProfile, () => SERVER_SNAPSHOT);
}

/**
 * Production auth profile: loads the Supabase session + profiles row.
 * Demo mode: mirrors useStoredProfile.
 */
export function useAuthProfile(): {
  profile: Profile;
  loading: boolean;
  signedIn: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
} {
  const demo = useStoredProfile();
  const [authState, setAuthState] = useState<{
    profile: Profile;
    loading: boolean;
    signedIn: boolean;
  }>(() =>
    config.hasSupabase
      ? { profile: SERVER_SNAPSHOT, loading: true, signedIn: false }
      : { profile: demo, loading: false, signedIn: true },
  );

  const refresh = useCallback(async () => {
    if (!config.hasSupabase) {
      setAuthState({
        profile: getProfile(),
        loading: false,
        signedIn: true,
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
    const next: Profile = {
      id: user.id,
      displayName: row?.display_name ?? "",
      contact: row?.contact ?? "",
    };
    cache = next;
    setAuthState({ profile: next, loading: false, signedIn: true });
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  useEffect(() => {
    if (!config.hasSupabase) return;
    // Session load is async IO — intentional mount effect.
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

  if (!config.hasSupabase) {
    return {
      profile: demo,
      loading: false,
      signedIn: true,
      signOut,
      refresh,
    };
  }

  return {
    profile: authState.profile,
    loading: authState.loading,
    signedIn: authState.signedIn,
    signOut,
    refresh,
  };
}
