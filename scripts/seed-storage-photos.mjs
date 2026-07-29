#!/usr/bin/env node
/**
 * Upload local seed JPEGs into Supabase Storage bucket `listing-photos`.
 *
 * Loads `.env` then `.env.local` from the repo root (does not override vars
 * already set in the shell).
 *
 * Local (default — falls back to `supabase status` when env unset):
 *   npm run seed:storage
 *
 * Cloud / remote project (reads SUPABASE_* from .env):
 *   npm run seed:storage:remote
 *
 * Required for remote:
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY   ← Dashboard → Settings → API → service_role
 *
 * Note: this only uploads files. Cloud DB still needs matching `photos`
 * rows (e.g. run the photos section of supabase/seed.sql in SQL Editor).
 */

import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BUCKET = "listing-photos";
const PREFIX = "seed";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PHOTOS_DIR = path.resolve(ROOT, "supabase/seed-photos");

const remoteOnly =
  process.argv.includes("--remote") || process.env.SEED_TARGET === "remote";

/** Minimal .env loader — no dependency. Does not override existing env. */
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function loadDotEnv() {
  loadEnvFile(path.join(ROOT, ".env"));
  loadEnvFile(path.join(ROOT, ".env.local"));
}

function parseStatusEnv(raw) {
  const out = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

function isLocalUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host === "127.0.0.1" || host === "localhost";
  } catch {
    return false;
  }
}

function maskUrl(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return url;
  }
}

function resolveCredentials() {
  const url =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (remoteOnly) {
    if (!url || !serviceRoleKey) {
      throw new Error(
        "Remote upload needs URL + service role in .env (or the shell):\n" +
          "  NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co\n" +
          "  SUPABASE_SERVICE_ROLE_KEY=eyJ…\n" +
          "Then: npm run seed:storage:remote",
      );
    }
    if (isLocalUrl(url)) {
      throw new Error(
        `Refusing --remote with local URL (${maskUrl(url)}). ` +
          "Point NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL at your cloud project.",
      );
    }
    return { url, serviceRoleKey, target: "remote" };
  }

  if (url && serviceRoleKey) {
    return {
      url,
      serviceRoleKey,
      target: isLocalUrl(url) ? "local" : "remote",
    };
  }

  try {
    const raw = execSync("supabase status -o env", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const env = parseStatusEnv(raw);
    const localUrl = env.API_URL || env.SUPABASE_URL;
    const localKey = env.SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
    if (localUrl && localKey) {
      return { url: localUrl, serviceRoleKey: localKey, target: "local" };
    }
  } catch {
    /* local CLI unavailable */
  }

  throw new Error(
    "Missing Supabase credentials.\n" +
      "Local: `supabase start`, then re-run (or put keys in .env).\n" +
      "Cloud: add SUPABASE_SERVICE_ROLE_KEY to .env and run " +
      "`npm run seed:storage:remote`.",
  );
}

async function main() {
  loadDotEnv();
  const { url, serviceRoleKey, target } = resolveCredentials();
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const files = (await readdir(PHOTOS_DIR)).filter((f) =>
    f.toLowerCase().endsWith(".jpg"),
  );
  if (files.length === 0) {
    throw new Error(`No .jpg files in ${PHOTOS_DIR}`);
  }

  console.log(
    `Target: ${target} (${maskUrl(url)}) → ${BUCKET}/${PREFIX}/ (${files.length} files)`,
  );
  for (const file of files) {
    const objectPath = `${PREFIX}/${file}`;
    const body = await readFile(path.join(PHOTOS_DIR, file));
    const { error } = await supabase.storage.from(BUCKET).upload(objectPath, body, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (error) throw new Error(`${objectPath}: ${error.message}`);
    console.log(`  ✓ ${objectPath}`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
