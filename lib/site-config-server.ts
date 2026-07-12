import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { defaultSettings, type SiteSettings } from "./site-config";

export const SITE_SETTINGS_CACHE_TAG = "site-settings";

const SITE_SETTINGS_SELECT =
  "id, app_name, logo_url, logo_alt, favicon_url, theme_color, marketplace_tenant_slug, meta_title, meta_description, meta_keywords, announcement_text, announcement_promo, footer_description, home_hero_eyebrow, home_hero_title, home_hero_description";

/** Stateless client — safe inside unstable_cache (no request cookies). */
function createPublicSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createPublicSupabase();
    const { data, error } = await supabase
      .from("site_settings")
      .select(SITE_SETTINGS_SELECT)
      .eq("id", 1)
      .single();

    if (error || !data) return defaultSettings;
    return { ...defaultSettings, ...data } as SiteSettings;
  } catch {
    return defaultSettings;
  }
}

/** Cross-request cache — bust with revalidateSiteSettings() after admin saves. */
const getCachedSiteSettings = unstable_cache(
  fetchSiteSettings,
  ["site-settings-v1"],
  { revalidate: 300, tags: [SITE_SETTINGS_CACHE_TAG] },
);

export const getSiteSettings = cache(getCachedSiteSettings);

export function revalidateSiteSettings() {
  revalidateTag(SITE_SETTINGS_CACHE_TAG, { expire: 0 });
}
