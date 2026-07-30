"use client";

import { useCallback, useEffect, useState } from "react";
import {
  legacyContactLabel,
  normalizePhone,
  normalizeTelegram,
  resolveContacts,
  type ContactChannels,
} from "@/domain/contacts";
import { config } from "@/lib/config";

/** Identity + editable profile from Supabase Auth + profiles table. */

export interface Profile extends ContactChannels {
  id: string;
  displayName: string;
  email: string;
  /** Google / OAuth picture URL when available. */
  avatarUrl: string;
}

const CHANGE_EVENT = "slf:profile-changed";
const SERVER_SNAPSHOT: Profile = {
  id: "server",
  displayName: "",
  email: "",
  avatarUrl: "",
  phone: "",
  telegram: "",
  whatsapp: "",
};

let cache: Profile | null = null;

function oauthAvatarUrl(user: {
  user_metadata?: Record<string, unknown> | null;
}): string {
  const meta = user.user_metadata ?? {};
  const raw =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    "";
  return raw.trim();
}

export function getProfile(): Profile {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  return cache ?? SERVER_SNAPSHOT;
}

export function saveProfile(
  update: Partial<
    Pick<
      Profile,
      "displayName" | "phone" | "telegram" | "whatsapp" | "avatarUrl"
    >
  >,
): Profile {
  const current = cache ?? SERVER_SNAPSHOT;
  const next: Profile = {
    ...current,
    ...update,
    phone: normalizePhone(update.phone ?? current.phone),
    telegram: normalizeTelegram(update.telegram ?? current.telegram),
    whatsapp: normalizePhone(update.whatsapp ?? current.whatsapp),
  };
  cache = next;
  window.dispatchEvent(new Event(CHANGE_EVENT));
  void persistProfileToSupabase(next);
  return next;
}

async function persistProfileToSupabase(profile: Profile) {
  if (!profile.id || profile.id === "server") return;
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const channels = {
    phone: profile.phone,
    telegram: profile.telegram,
    whatsapp: profile.whatsapp,
  };
  await supabase.from("profiles").upsert({
    id: profile.id,
    display_name: profile.displayName,
    phone: channels.phone,
    telegram: channels.telegram,
    whatsapp: channels.whatsapp,
    contact: legacyContactLabel(channels),
    avatar_url: profile.avatarUrl,
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
      .select("display_name, contact, phone, telegram, whatsapp, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    const metadataName =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      "";
    const channels = resolveContacts({
      phone: row?.phone,
      telegram: row?.telegram,
      whatsapp: row?.whatsapp,
      contact: row?.contact,
    });
    const fromOauth = oauthAvatarUrl(user);
    const avatarUrl = fromOauth || (row?.avatar_url ?? "").trim();
    const displayName = row?.display_name || metadataName;
    const next: Profile = {
      id: user.id,
      displayName,
      email: user.email ?? "",
      avatarUrl,
      ...channels,
    };
    // Create/update row so Google name + avatar persist for listing cards.
    if (
      !row ||
      (fromOauth && row.avatar_url !== fromOauth) ||
      (!row.display_name && metadataName)
    ) {
      await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName || "Neighbor",
        avatar_url: avatarUrl,
        phone: channels.phone,
        telegram: channels.telegram,
        whatsapp: channels.whatsapp,
        contact: legacyContactLabel(channels),
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
