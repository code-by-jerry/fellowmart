import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import type { StorefrontCategory } from "@/lib/catalog/category-display";

export async function getTenantCategories(
  tenantId: string,
): Promise<StorefrontCategory[]> {
  return getTenantCategoriesCached(tenantId);
}

const getTenantCategoriesCached = cache(
  async (tenantId: string): Promise<StorefrontCategory[]> => {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (categories ?? []) as StorefrontCategory[];
  },
);

export async function getTenantCategoryBySlug(
  tenantId: string,
  slug: string,
): Promise<StorefrontCategory | null> {
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return (category as StorefrontCategory | null) ?? null;
}
