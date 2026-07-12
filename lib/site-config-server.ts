import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { defaultSettings, type SiteSettings } from "./site-config";

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
      .select(
        "id, app_name, tagline, theme_color, logo_url, favicon_url, marketplace_tenant_slug, meta_title, meta_description, meta_keywords, contact_email, contact_phone, social_links",
      )
      .eq("id", 1)
      .single();

    if (error || !data) return defaultSettings;
    return { ...defaultSettings, ...data } as SiteSettings;
  } catch {
    return defaultSettings;
  }
}

/** Cross-request cache — site settings change rarely; cuts Supabase on every page. */
const getCachedSiteSettings = unstable_cache(
  fetchSiteSettings,
  ["site-settings-v1"],
  { revalidate: 300 },
);

export const getSiteSettings = cache(getCachedSiteSettings);
