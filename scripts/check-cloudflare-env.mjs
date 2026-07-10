#!/usr/bin/env node
/**
 * Validates required env vars for Cloudflare build/deploy.
 * Reads .env.local (or path from DOTENV_PATH).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), process.env.DOTENV_PATH ?? ".env.local");

const REQUIRED = [
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
];

function parseEnvFile(path) {
  const vars = {};
  if (!existsSync(path)) return vars;
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

const env = parseEnvFile(envPath);
const missing = [];
const invalid = [];

for (const key of REQUIRED) {
  const value = env[key]?.trim();
  if (!value) {
    missing.push(key);
    continue;
  }
  if (value === "..." || value.includes("your-") || value.includes("xxx")) {
    invalid.push(key);
  }
}

if (env.NEXT_PUBLIC_APP_URL?.includes("localhost")) {
  console.warn(
    "WARN: NEXT_PUBLIC_APP_URL is still localhost — update to production URL before deploy.",
  );
}

if (missing.length) {
  console.error(`Missing in ${envPath}:`);
  for (const key of missing) console.error(`  - ${key}`);
  process.exit(1);
}

if (invalid.length) {
  console.error(`Placeholder values in ${envPath}:`);
  for (const key of invalid) console.error(`  - ${key}`);
  process.exit(1);
}

console.log(`OK: ${REQUIRED.length} required variables present in ${envPath}`);
