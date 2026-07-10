import { cache } from "react";
import { getTenantBySlug } from "@/lib/catalog/tenant-catalog";
import { getSiteSettings } from "@/lib/site-config-server";
import { storePath } from "@/lib/routes/store-routes";
import type { SiteSettings } from "@/lib/site-config";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import {
  BASE_CURRENCY,
  normalizeCurrency,
  type StoreCurrencyCode,
} from "@/lib/currency/currencies";
import { getRateTo } from "@/lib/currency/rates";

export type StorefrontContext = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  basePath: string;
  settings: SiteSettings;
  businessType?: string | null;
  themeColor: string;
  /** Display currency chosen by store admin */
  currency: StoreCurrencyCode;
  /** FX rate: 1 INR → display currency */
  fxRate: number;
  fxFetchedAt: string | null;
  fxSource: string;
};

type TenantBrandingRow = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  primary_color?: string | null;
  currency?: string | null;
  business_type?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  announcement_text?: string | null;
  announcement_promo?: string | null;
  footer_description?: string | null;
  home_hero_eyebrow?: string | null;
  home_hero_title?: string | null;
  home_hero_description?: string | null;
  settings?: Record<string, unknown> | null;
};

function pick(
  column: string | null | undefined,
  fromJson: unknown,
  fallback: string,
) {
  if (typeof column === "string" && column.trim()) return column;
  if (typeof fromJson === "string" && fromJson.trim()) return fromJson;
  return fallback;
}

function pickNullable(
  column: string | null | undefined,
  fromJson: unknown,
  fallback: string | null,
) {
  if (typeof column === "string" && column.trim()) return column;
  if (typeof fromJson === "string" && fromJson.trim()) return fromJson;
  return fallback;
}

async function buildStorefrontContext(
  rawSlug: string,
): Promise<StorefrontContext | null> {
  const tenantSlug = normalizeTenantSlug(rawSlug);
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    return null;
  }

  const platformSettings = await getSiteSettings();
  const tenantSettings = (tenant.settings ?? {}) as Partial<SiteSettings>;
  const themeColor =
    (typeof tenant.primary_color === "string" && tenant.primary_color.trim()
      ? tenant.primary_color
      : null) ??
    (typeof tenantSettings.theme_color === "string"
      ? tenantSettings.theme_color
      : null) ??
    platformSettings.theme_color;

  const currency = normalizeCurrency(tenant.currency ?? BASE_CURRENCY);
  const fx = await getRateTo(currency);

  const settings: SiteSettings = {
    ...platformSettings,
    app_name: tenant.name || platformSettings.app_name,
    logo_url: pickNullable(
      tenant.logo_url,
      tenantSettings.logo_url,
      platformSettings.logo_url,
    ),
    logo_alt: `${tenant.name} logo`,
    favicon_url: pickNullable(
      tenant.favicon_url,
      tenantSettings.favicon_url,
      platformSettings.favicon_url,
    ),
    theme_color: themeColor,
    meta_title: pick(
      tenant.meta_title,
      tenantSettings.meta_title,
      `${tenant.name} — Shop online`,
    ),
    meta_description: pick(
      tenant.meta_description,
      tenantSettings.meta_description,
      platformSettings.meta_description,
    ),
    meta_keywords: pick(
      tenant.meta_keywords,
      tenantSettings.meta_keywords,
      platformSettings.meta_keywords,
    ),
    announcement_text: pick(
      tenant.announcement_text,
      tenantSettings.announcement_text,
      platformSettings.announcement_text,
    ),
    announcement_promo: pick(
      tenant.announcement_promo,
      tenantSettings.announcement_promo,
      platformSettings.announcement_promo,
    ),
    footer_description: pick(
      tenant.footer_description,
      tenantSettings.footer_description,
      platformSettings.footer_description,
    ),
    home_hero_eyebrow: pick(
      tenant.home_hero_eyebrow,
      tenantSettings.home_hero_eyebrow,
      platformSettings.home_hero_eyebrow,
    ),
    home_hero_title: pick(
      tenant.home_hero_title,
      tenantSettings.home_hero_title,
      `Welcome to ${tenant.name}`,
    ),
    home_hero_description: pick(
      tenant.home_hero_description,
      tenantSettings.home_hero_description,
      platformSettings.home_hero_description,
    ),
    marketplace_tenant_slug: tenant.slug,
  };

  return {
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    tenantName: tenant.name,
    basePath: storePath(tenant.slug),
    settings,
    businessType: tenant.business_type ?? null,
    themeColor,
    currency,
    fxRate: fx.rate,
    fxFetchedAt: fx.fetchedAt,
    fxSource: fx.source,
  };
}

export const getStorefrontContext = cache(buildStorefrontContext);

export { formatStorePrice } from "@/lib/storefront/pricing";
