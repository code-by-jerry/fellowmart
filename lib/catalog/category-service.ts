import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/admin/slugify";

export type CategoryInput = {
  name: string;
  slug?: string;
  description?: string | null;
  image_url?: string | null;
  parent_category_id?: string | null;
  sort_order?: number;
  icon_name?: string | null;
  product_count_text?: string | null;
  is_active?: boolean;
};

function normalizeCategoryInput(input: CategoryInput) {
  const name = input.name.trim();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(name);

  if (!name) {
    throw new Error("Category name is required.");
  }
  if (!slug) {
    throw new Error("A valid slug is required.");
  }

  return {
    name,
    slug,
    description: input.description?.trim() || null,
    image_url: input.image_url?.trim() || null,
    parent_category_id: input.parent_category_id?.trim() || null,
    sort_order: Number.isFinite(input.sort_order) ? Number(input.sort_order) : 0,
    icon_name: input.icon_name?.trim() || null,
    product_count_text: input.product_count_text?.trim() || null,
    is_active: input.is_active ?? true,
  };
}

export async function createCategory(
  db: SupabaseClient,
  tenantId: string,
  input: CategoryInput,
) {
  const payload = normalizeCategoryInput(input);

  const { data, error } = await db
    .from("categories")
    .insert({
      tenant_id: tenantId,
      ...payload,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function updateCategory(
  db: SupabaseClient,
  tenantId: string,
  categoryId: string,
  input: CategoryInput,
) {
  const payload = normalizeCategoryInput(input);

  const { error } = await db
    .from("categories")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", categoryId)
    .eq("tenant_id", tenantId);

  if (error) throw new Error(error.message);
}

export async function deleteCategory(
  db: SupabaseClient,
  tenantId: string,
  categoryId: string,
) {
  const { error } = await db
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("tenant_id", tenantId);

  if (error) {
    if (error.code === "23503") {
      throw new Error("Cannot delete: category has products assigned.");
    }
    throw new Error(error.message);
  }
}
