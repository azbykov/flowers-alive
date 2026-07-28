"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "listing-photos";

/**
 * Upload resized photo blobs to Supabase Storage.
 * Paths are `{userId}/{uuid}.jpg` so RLS can scope by auth.uid().
 * Returns storage object paths (not public URLs) for the listings.photos table.
 */
export async function uploadListingPhotos(
  blobs: Blob[],
  userId: string,
): Promise<string[]> {
  const supabase = createClient();
  const paths: string[] = [];

  for (const blob of blobs) {
    const path = `${userId}/${crypto.randomUUID()}.jpg`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (error) throw new Error(error.message);
    paths.push(path);
  }

  return paths;
}
