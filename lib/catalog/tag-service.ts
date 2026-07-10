import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/admin/slugify";

export type TagRecord = {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  is_active: boolean;
  usage_count?: number;
};

function normalizeTagName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export async function listTags(
  db: SupabaseClient,
  tenantId: string,
  options?: { activeOnly?: boolean; query?: string; limit?: number },
) {
  let query = db
    .from("tags")
    .select("id, tenant_id, name, slug, is_active, usage_count")
    .eq("tenant_id", tenantId)
    .order("usage_count", { ascending: false })
    .order("name", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const search = options?.query?.trim();
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as TagRecord[];
}

export async function createTag(
  db: SupabaseClient,
  tenantId: string,
  nameInput: string,
) {
  const name = normalizeTagName(nameInput);
  const slug = slugify(name);

  if (!name) {
    throw new Error("Tag name is required.");
  }
  if (!slug) {
    throw new Error("A valid tag name is required.");
  }

  const { data: existing } = await db
    .from("tags")
    .select("id, tenant_id, name, slug, is_active, usage_count")
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    if (!existing.is_active) {
      await db
        .from("tags")
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .eq("tenant_id", tenantId);
      return { ...(existing as TagRecord), is_active: true };
    }
    return existing as TagRecord;
  }

  const { data, error } = await db
    .from("tags")
    .insert({
      tenant_id: tenantId,
      name,
      slug,
      is_active: true,
    })
    .select("id, tenant_id, name, slug, is_active, usage_count")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: raced } = await db
        .from("tags")
        .select("id, tenant_id, name, slug, is_active, usage_count")
        .eq("tenant_id", tenantId)
        .eq("slug", slug)
        .maybeSingle();
      if (raced) return raced as TagRecord;
    }
    throw new Error(error.message);
  }

  return data as TagRecord;
}

export async function ensureTagsExist(
  db: SupabaseClient,
  tenantId: string,
  tagNames: string[],
) {
  const uniqueNames = Array.from(
    new Set(
      tagNames
        .map(normalizeTagName)
        .filter(Boolean)
        .map((name) => name),
    ),
  );

  const created: TagRecord[] = [];
  for (const name of uniqueNames) {
    created.push(await createTag(db, tenantId, name));
  }
  return created;
}

export async function refreshTagUsageCounts(
  db: SupabaseClient,
  tenantId: string,
) {
  const { data: products, error } = await db
    .from("products")
    .select("tags")
    .eq("tenant_id", tenantId);

  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const product of products ?? []) {
    for (const raw of product.tags ?? []) {
      const slug = slugify(String(raw));
      if (!slug) continue;
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }

  const { data: tags } = await db
    .from("tags")
    .select("id, slug")
    .eq("tenant_id", tenantId);

  for (const tag of tags ?? []) {
    await db
      .from("tags")
      .update({
        usage_count: counts.get(tag.slug) ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tag.id)
      .eq("tenant_id", tenantId);
  }
}
