import { createClient } from "@/utils/supabase/server";
import { getSiteSettings } from "@/lib/site-config-server";
import type { StorefrontCategory } from "@/lib/catalog/category-display";

export async function getMarketplaceCategories(): Promise<StorefrontCategory[]> {
  const settings = await getSiteSettings();
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", settings.marketplace_tenant_slug ?? "fellowmart")
    .eq("is_active", true)
    .maybeSingle();

  if (!tenant) {
    return [];
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (categories ?? []) as StorefrontCategory[];
}

export async function getMarketplaceCategoryBySlug(
  slug: string
): Promise<StorefrontCategory | null> {
  const settings = await getSiteSettings();
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", settings.marketplace_tenant_slug ?? "fellowmart")
    .eq("is_active", true)
    .maybeSingle();

  if (!tenant) {
    return null;
  }

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return (category as StorefrontCategory | null) ?? null;
}
