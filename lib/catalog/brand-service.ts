import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/admin/slugify";

export type BrandInput = {
  name: string;
  slug?: string;
  description?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export type BrandRecord = {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

function normalizeBrandInput(input: BrandInput) {
  const name = input.name.trim();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(name);

  if (!name) {
    throw new Error("Brand name is required.");
  }
  if (!slug) {
    throw new Error("A valid slug is required.");
  }

  return {
    name,
    slug,
    description: input.description?.trim() || null,
    logo_url: input.logo_url?.trim() || null,
    website_url: input.website_url?.trim() || null,
    sort_order: Number.isFinite(input.sort_order) ? Number(input.sort_order) : 0,
    is_active: input.is_active ?? true,
  };
}

export async function createBrand(
  db: SupabaseClient,
  tenantId: string,
  input: BrandInput,
) {
  const payload = normalizeBrandInput(input);

  const { data, error } = await db
    .from("brands")
    .insert({
      tenant_id: tenantId,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A brand with this slug already exists.");
    }
    throw new Error(error.message);
  }

  return data.id as string;
}

export async function updateBrand(
  db: SupabaseClient,
  tenantId: string,
  brandId: string,
  input: BrandInput,
) {
  const payload = normalizeBrandInput(input);

  const { error } = await db
    .from("brands")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", brandId)
    .eq("tenant_id", tenantId);

  if (error) {
    if (error.code === "23505") {
      throw new Error("A brand with this slug already exists.");
    }
    throw new Error(error.message);
  }

  // Keep denormalized product.brand text in sync for storefront display
  await db
    .from("products")
    .update({
      brand: payload.name,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", tenantId)
    .eq("brand_id", brandId);
}

export async function deleteBrand(
  db: SupabaseClient,
  tenantId: string,
  brandId: string,
) {
  const { count, error: countError } = await db
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("brand_id", brandId);

  if (countError) throw new Error(countError.message);

  if ((count ?? 0) > 0) {
    throw new Error("Cannot delete a brand that is assigned to products.");
  }

  const { error } = await db
    .from("brands")
    .delete()
    .eq("id", brandId)
    .eq("tenant_id", tenantId);

  if (error) throw new Error(error.message);
}

export async function listBrands(
  db: SupabaseClient,
  tenantId: string,
  options?: { activeOnly?: boolean },
) {
  let query = db
    .from("brands")
    .select(
      "id, tenant_id, name, slug, description, logo_url, website_url, sort_order, is_active, created_at, updated_at",
    )
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as BrandRecord[];
}
