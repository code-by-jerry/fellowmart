import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

const TENANT_BRANDING_SELECT =
  "id, name, slug, settings, onboarding_status, is_active, business_type, logo_url, favicon_url, primary_color, currency, meta_title, meta_description, meta_keywords, announcement_text, announcement_promo, footer_description, home_hero_eyebrow, home_hero_title, home_hero_description";

async function fetchTenantBySlug(tenantSlug: string) {
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select(TENANT_BRANDING_SELECT)
    .eq("slug", tenantSlug)
    .maybeSingle();

  if (!tenant || !tenant.is_active) {
    return null;
  }

  return tenant;
}

/** Lightweight tenant row for branding/context — avoids loading the full catalog. */
export const getTenantBySlug = cache(fetchTenantBySlug);

async function fetchTenantCatalog(tenantSlug: string) {
  const supabase = await createClient();

  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    return null;
  }

  const [{ data: categories }, { data: collections }, { data: products }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("collections")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("products")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    ]);

  return {
    tenant,
    categories: categories ?? [],
    collections: collections ?? [],
    products: products ?? [],
  };
}

export const getTenantCatalog = cache(fetchTenantCatalog);
