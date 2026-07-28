"use client";

import { useSyncExternalStore } from "react";

const KEY = "slf.favorites";
const CHANGE_EVENT = "slf:favorites-changed";
const SERVER_SNAPSHOT: string[] = [];

let cache: string[] | null = null;

function read(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function getFavoriteIds(): string[] {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  cache ??= read();
  return cache;
}

export function toggleFavorite(id: string): boolean {
  const ids = getFavoriteIds();
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  cache = next;
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return next.includes(id);
}

function subscribe(onChange: () => void): () => void {
  const handler = () => {
    cache = null;
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler); // other tabs
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Reactive favorite state — updates every heart everywhere on toggle. */
export function useFavorite(id: string): boolean {
  const ids = useSyncExternalStore(subscribe, getFavoriteIds, () => SERVER_SNAPSHOT);
  return ids.includes(id);
}
