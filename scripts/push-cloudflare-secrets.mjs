#!/usr/bin/env node
/**
 * Push server secrets from .env.local to the Cloudflare Worker via Wrangler.
 * Requires: wrangler login (or CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID).
 *
 * Usage: npm run cf:push-secrets
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const envPath = resolve(process.cwd(), process.env.DOTENV_PATH ?? ".env.local");

const SECRET_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SITE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_URL_ENDPOINT",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "PLATFORM_ADMIN_EMAIL",
  "GOOGLE_MAP_API_KEY",
];

function parseEnvFile(path) {
  const vars = {};
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

if (!existsSync(envPath)) {
  console.error(`Env file not found: ${envPath}`);
  process.exit(1);
}

const env = parseEnvFile(envPath);
let failed = false;

for (const key of SECRET_KEYS) {
  const value = env[key]?.trim();
  if (!value || value === "..." || key === "GOOGLE_MAP_API_KEY" && !value) {
    if (key !== "GOOGLE_MAP_API_KEY") {
      console.warn(`Skipping ${key} (empty or placeholder)`);
    }
    continue;
  }

  console.log(`Setting secret: ${key}`);
  const result = spawnSync(
    "npx",
    ["wrangler", "secret", "put", key, "--config", "wrangler.jsonc"],
    {
      input: value,
      stdio: ["pipe", "inherit", "inherit"],
      shell: true,
    },
  );

  if (result.status !== 0) {
    console.error(`Failed to set ${key}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log("\nDone. Secrets synced to Worker 'fellowmart'.");
