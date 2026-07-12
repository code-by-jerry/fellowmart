#!/usr/bin/env node
/**
 * Print GitHub Actions secrets to configure for CI deploy.
 * Copy values from .env.local — does not print secret values.
 *
 * Usage: node scripts/print-github-secrets-checklist.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.local");

const GITHUB_SECRETS = [
  { name: "CLOUDFLARE_API_TOKEN", source: "Cloudflare Dashboard → API Tokens → Workers Scripts Edit" },
  { name: "CLOUDFLARE_ACCOUNT_ID", source: "e677b88707a29057547907be572c967b" },
  { name: "NEXT_PUBLIC_SUPABASE_URL", source: ".env.local" },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", source: ".env.local" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", source: ".env.local" },
  { name: "IMAGEKIT_PUBLIC_KEY", source: ".env.local" },
  { name: "IMAGEKIT_PRIVATE_KEY", source: ".env.local" },
  { name: "IMAGEKIT_URL_ENDPOINT", source: ".env.local" },
  { name: "RAZORPAY_KEY_ID", source: ".env.local" },
  { name: "RAZORPAY_KEY_SECRET", source: ".env.local" },
  { name: "RAZORPAY_WEBHOOK_SECRET", source: "Razorpay webhook dashboard (or .env.local)" },
  { name: "PLATFORM_ADMIN_EMAIL", source: ".env.local" },
];

function parseEnvFile(path) {
  const vars = {};
  if (!existsSync(path)) return vars;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

const env = parseEnvFile(envPath);

console.log("GitHub repo → Settings → Secrets and variables → Actions → New repository secret\n");
for (const { name, source } of GITHUB_SECRETS) {
  const fromEnv = env[name];
  const status =
    name === "CLOUDFLARE_API_TOKEN" || name === "CLOUDFLARE_ACCOUNT_ID"
      ? "(set manually)"
      : fromEnv && fromEnv !== "..." && !fromEnv.includes("pending_configure")
        ? "✓ in .env.local"
        : "⚠ missing or placeholder in .env.local";
  console.log(`  ${name}`);
  console.log(`    Source: ${source}`);
  console.log(`    Status: ${status}\n`);
}

console.log("After secrets are set: push to master or run Actions → Deploy to Cloudflare Workers → Run workflow");
