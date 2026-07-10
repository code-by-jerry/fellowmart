import { normalizeTenantSlug } from "@/lib/utils/tenant";

/** Top-level app routes — tenant slugs cannot use these names. */
export const RESERVED_TENANT_SLUGS = new Set([
  "admin",
  "api",
  "apply",
  "auth",
  "business",
  "categories",
  "dashboard",
  "login",
  "profile",
  "store",
  "_next",
  "favicon.ico",
  "fellowmart",
]);

/** Root path segments that must never be treated as legacy tenant slugs. */
export const RESERVED_ROOT_SEGMENTS = RESERVED_TENANT_SLUGS;

export function storePath(slug: string, subpath = ""): string {
  const normalized = normalizeTenantSlug(slug);
  const suffix = subpath ? (subpath.startsWith("/") ? subpath : `/${subpath}`) : "";
  return `/store/${normalized}${suffix}`;
}

export function isReservedTenantSlug(slug: string): boolean {
  const normalized = normalizeTenantSlug(slug);
  return !normalized || RESERVED_TENANT_SLUGS.has(normalized);
}

export function validateTenantSlug(slug: string): string | null {
  const normalized = normalizeTenantSlug(slug);
  if (!normalized) {
    return "A valid store URL slug is required.";
  }
  if (isReservedTenantSlug(normalized)) {
    return `"${normalized}" is reserved. Choose another store URL.`;
  }
  return null;
}

/**
 * Redirect legacy `/{slug}/...` URLs to `/store/{slug}/...`.
 * Returns null when the path should not be redirected.
 */
export function getLegacyStoreRedirect(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  if (segments[0] === "store") return null;
  if (RESERVED_ROOT_SEGMENTS.has(segments[0])) return null;

  const slug = segments[0];
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const rest = segments.slice(1).join("/");
  return storePath(slug, rest);
}
