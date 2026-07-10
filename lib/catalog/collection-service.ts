import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/admin/slugify";

export type CollectionInput = {
  name: string;
  slug?: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

function normalizeCollectionInput(input: CollectionInput) {
  const name = input.name.trim();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(name);

  if (!name) {
    throw new Error("Collection name is required.");
  }
  if (!slug) {
    throw new Error("A valid slug is required.");
  }

  return {
    name,
    slug,
    description: input.description?.trim() || null,
    image_url: input.image_url?.trim() || null,
    sort_order: Number.isFinite(input.sort_order) ? Number(input.sort_order) : 0,
    is_active: input.is_active ?? true,
  };
}

export async function createCollection(
  db: SupabaseClient,
  tenantId: string,
  input: CollectionInput,
) {
  const payload = normalizeCollectionInput(input);

  const { data, error } = await db
    .from("collections")
    .insert({
      tenant_id: tenantId,
      ...payload,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function updateCollection(
  db: SupabaseClient,
  tenantId: string,
  collectionId: string,
  input: CollectionInput,
) {
  const payload = normalizeCollectionInput(input);

  const { error } = await db
    .from("collections")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", collectionId)
    .eq("tenant_id", tenantId);

  if (error) throw new Error(error.message);
}

export async function deleteCollection(
  db: SupabaseClient,
  tenantId: string,
  collectionId: string,
) {
  const { error } = await db
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("tenant_id", tenantId);

  if (error) {
    if (error.code === "23503") {
      throw new Error("Cannot delete: collection has linked products.");
    }
    throw new Error(error.message);
  }
}
