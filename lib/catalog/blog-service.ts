import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/admin/slugify";

export type BlogPostStatus = "draft" | "published";

export type BlogPostInput = {
  title: string;
  slug?: string;
  excerpt?: string | null;
  body?: string | null;
  cover_image_url?: string | null;
  author_name?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  status?: BlogPostStatus;
  is_active?: boolean;
  published_at?: string | null;
  sort_order?: number;
};

export type BlogPostRecord = {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body: string;
  cover_image_url?: string | null;
  author_name?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  status: BlogPostStatus;
  is_active: boolean;
  published_at?: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

function normalizeBlogPostInput(input: BlogPostInput) {
  const title = input.title.trim();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(title);
  const status: BlogPostStatus =
    input.status === "published" ? "published" : "draft";

  if (!title) throw new Error("Post title is required.");
  if (!slug) throw new Error("A valid slug is required.");

  let publishedAt = input.published_at?.trim() || null;
  if (status === "published" && !publishedAt) {
    publishedAt = new Date().toISOString();
  }
  if (status === "draft") {
    // Keep existing published_at if provided; otherwise null for drafts
    publishedAt = publishedAt || null;
  }

  return {
    title,
    slug,
    excerpt: input.excerpt?.trim() || null,
    body: input.body?.trim() || "",
    cover_image_url: input.cover_image_url?.trim() || null,
    author_name: input.author_name?.trim() || null,
    meta_title: input.meta_title?.trim() || null,
    meta_description: input.meta_description?.trim() || null,
    meta_keywords: input.meta_keywords?.trim() || null,
    status,
    is_active: input.is_active ?? true,
    published_at: publishedAt,
    sort_order: Number.isFinite(input.sort_order) ? Number(input.sort_order) : 0,
  };
}

export async function createBlogPost(
  db: SupabaseClient,
  tenantId: string,
  input: BlogPostInput,
) {
  const payload = normalizeBlogPostInput(input);

  const { data, error } = await db
    .from("blog_posts")
    .insert({
      tenant_id: tenantId,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A blog post with this slug already exists.");
    }
    throw new Error(error.message);
  }

  return data.id as string;
}

export async function updateBlogPost(
  db: SupabaseClient,
  tenantId: string,
  postId: string,
  input: BlogPostInput,
) {
  const payload = normalizeBlogPostInput(input);

  // If publishing and no published_at was set, stamp now
  if (payload.status === "published" && !input.published_at) {
    const { data: existing } = await db
      .from("blog_posts")
      .select("published_at")
      .eq("id", postId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (existing?.published_at) {
      payload.published_at = existing.published_at;
    }
  }

  const { error } = await db
    .from("blog_posts")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("tenant_id", tenantId);

  if (error) {
    if (error.code === "23505") {
      throw new Error("A blog post with this slug already exists.");
    }
    throw new Error(error.message);
  }
}

export async function deleteBlogPost(
  db: SupabaseClient,
  tenantId: string,
  postId: string,
) {
  const { error } = await db
    .from("blog_posts")
    .delete()
    .eq("id", postId)
    .eq("tenant_id", tenantId);

  if (error) throw new Error(error.message);
}

export async function listBlogPosts(
  db: SupabaseClient,
  tenantId: string,
  options?: { publishedOnly?: boolean },
) {
  let query = db
    .from("blog_posts")
    .select(
      "id, tenant_id, title, slug, excerpt, body, cover_image_url, author_name, meta_title, meta_description, meta_keywords, status, is_active, published_at, sort_order, created_at, updated_at",
    )
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (options?.publishedOnly) {
    query = query
      .eq("status", "published")
      .eq("is_active", true)
      .lte("published_at", new Date().toISOString());
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as BlogPostRecord[];
}

export async function getPublishedBlogPosts(tenantId: string, limit = 24) {
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, cover_image_url, author_name, published_at, meta_description",
    )
    .eq("tenant_id", tenantId)
    .eq("status", "published")
    .eq("is_active", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[blog_posts]", error.message);
    return [];
  }

  const now = Date.now();
  return ((data ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image_url: string | null;
    author_name: string | null;
    published_at: string | null;
    meta_description: string | null;
  }>).filter(
    (post) => !post.published_at || new Date(post.published_at).getTime() <= now,
  );
}

export async function getPublishedBlogPostBySlug(
  tenantId: string,
  postSlug: string,
) {
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, excerpt, body, cover_image_url, author_name, meta_title, meta_description, meta_keywords, published_at, updated_at",
    )
    .eq("tenant_id", tenantId)
    .eq("slug", postSlug)
    .eq("status", "published")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[blog_posts]", error.message);
    return null;
  }

  if (!data) return null;

  if (data.published_at && new Date(data.published_at) > new Date()) {
    return null;
  }

  return data as BlogPostRecord;
}

/** Escape HTML then apply light markdown-ish formatting for SEO-friendly HTML. */
export { renderRichTextHtml as renderBlogBodyHtml } from "@/lib/content/rich-text";

export function formatBlogDate(value?: string | null) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return null;
  }
}
