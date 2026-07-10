import { cookies } from "next/headers";
import { getSiteSettings } from "@/lib/site-config-server";
import { normalizeTenantSlug } from "@/lib/utils/tenant";

/** Remembers the last storefront the customer visited (for /profile, login return, etc.). */
export const STORE_SLUG_COOKIE = "fm_store_slug";

export function storeSlugFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/store\/([^/?#]+)/);
  if (!match) return null;
  const slug = normalizeTenantSlug(decodeURIComponent(match[1]));
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return null;
  return slug;
}

export function storeSlugCookieOptions(slug: string) {
  return {
    name: STORE_SLUG_COOKIE,
    value: normalizeTenantSlug(slug),
    options: {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax" as const,
      httpOnly: false,
    },
  };
}

/**
 * Resolve which storefront a customer page should use:
 * explicit slug → cookie → marketplace demo store.
 */
export async function resolveCustomerStoreSlug(
  explicit?: string | null,
): Promise<string> {
  if (explicit?.trim()) {
    return normalizeTenantSlug(explicit);
  }

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(STORE_SLUG_COOKIE)?.value;
  if (fromCookie?.trim()) {
    return normalizeTenantSlug(fromCookie);
  }

  const settings = await getSiteSettings();
  return normalizeTenantSlug(settings.marketplace_tenant_slug || "fellowmart");
}
