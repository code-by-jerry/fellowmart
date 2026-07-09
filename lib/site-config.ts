// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteSettings {
  app_name: string
  logo_url: string | null
  logo_alt: string
  favicon_url: string | null
  theme_color: string
  meta_title: string
  meta_description: string
  meta_keywords: string
  announcement_text: string
  announcement_promo: string
  footer_description: string
  home_hero_eyebrow: string
  home_hero_title: string
  home_hero_description: string
  marketplace_tenant_slug: string
}

// ─── Defaults (used as fallback if DB is unavailable) ────────────────────────

export const defaultSettings: SiteSettings = {
  app_name: 'fellowmate',
  logo_url: null,
  logo_alt: 'fellowmate logo',
  favicon_url: null,
  theme_color: '#000000',
  meta_title: 'fellowmate — Commerce for Local Businesses',
  meta_description: 'Discover and order from local stores near you.',
  meta_keywords: 'local store, ecommerce, fellowmate',
  announcement_text: 'Free shipping on orders above $49.',
  announcement_promo: 'Get 10% off your first order. Use code: WELCOME10',
  footer_description: 'Your one-stop destination for premium products across all categories.',
  home_hero_eyebrow: 'New Collection',
  home_hero_title: 'Elevate Your Everyday',
  home_hero_description: 'Discover premium products that combine style, quality and value.',
  marketplace_tenant_slug: 'fellowmart',
}


// ─── Helper: build per-page metadata ─────────────────────────────────────────

import type { Metadata } from 'next'

export function buildMetadata(
  settings: SiteSettings,
  override?: Partial<{
    title: string
    description: string
    path: string
  }>
): Metadata {
  const title = override?.title
    ? `${override.title} | ${settings.app_name}`
    : settings.meta_title

  const description = override?.description ?? settings.meta_description

  return {
    title,
    description,
    keywords: settings.meta_keywords,
    icons: settings.favicon_url ? { icon: settings.favicon_url } : undefined,
    openGraph: {
      title,
      description,
      siteName: settings.app_name,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

import type { Viewport } from 'next'

export function buildViewport(settings: SiteSettings): Viewport {
  return {
    themeColor: settings.theme_color,
  }
}
