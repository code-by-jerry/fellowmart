import { createClient } from "@/utils/supabase/server";

export async function getTenantCatalog(tenantSlug: string) {
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug, settings, onboarding_status")
    .eq("slug", tenantSlug)
    .maybeSingle();

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
