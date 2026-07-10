import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/admin/slugify";

export type StorePageStatus = "draft" | "published";
export type StorePageFooterGroup = "company" | "help" | "none";

/** Slugs that conflict with built-in storefront routes. */
export const RESERVED_PAGE_SLUGS = new Set([
  "blog",
  "cart",
  "categories",
  "collections",
  "products",
  "pages",
  "account",
  "checkout",
  "login",
  "search",
  "wishlist",
  "api",
  "admin",
  "orders",
]);

export type StorePageInput = {
  title: string;
  slug?: string;
  body?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  footer_group?: StorePageFooterGroup;
  show_in_footer?: boolean;
  status?: StorePageStatus;
  is_active?: boolean;
  sort_order?: number;
};

export type StorePageRecord = {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  body: string;
  meta_title?: string | null;
  meta_description?: string | null;
  footer_group: StorePageFooterGroup;
  show_in_footer: boolean;
  status: StorePageStatus;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type FooterPageLink = {
  id: string;
  title: string;
  slug: string;
  footer_group: StorePageFooterGroup;
};

function normalizeStorePageInput(input: StorePageInput) {
  const title = input.title.trim();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(title);
  const status: StorePageStatus =
    input.status === "published" ? "published" : "draft";
  const footerGroup: StorePageFooterGroup =
    input.footer_group === "help" || input.footer_group === "none"
      ? input.footer_group
      : "company";

  if (!title) throw new Error("Page title is required.");
  if (!slug) throw new Error("A valid slug is required.");
  if (RESERVED_PAGE_SLUGS.has(slug)) {
    throw new Error(
      `Slug "${slug}" is reserved. Choose another (e.g. privacy-policy).`,
    );
  }

  return {
    title,
    slug,
    body: input.body?.trim() || "",
    meta_title: input.meta_title?.trim() || null,
    meta_description: input.meta_description?.trim() || null,
    footer_group: footerGroup,
    show_in_footer:
      footerGroup === "none" ? false : (input.show_in_footer ?? true),
    status,
    is_active: input.is_active ?? true,
    sort_order: Number.isFinite(input.sort_order) ? Number(input.sort_order) : 0,
  };
}

export async function createStorePage(
  db: SupabaseClient,
  tenantId: string,
  input: StorePageInput,
) {
  const payload = normalizeStorePageInput(input);

  const { data, error } = await db
    .from("store_pages")
    .insert({
      tenant_id: tenantId,
      ...payload,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A page with this slug already exists.");
    }
    throw new Error(error.message);
  }

  return data.id as string;
}

export async function updateStorePage(
  db: SupabaseClient,
  tenantId: string,
  pageId: string,
  input: StorePageInput,
) {
  const payload = normalizeStorePageInput(input);

  const { error } = await db
    .from("store_pages")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pageId)
    .eq("tenant_id", tenantId);

  if (error) {
    if (error.code === "23505") {
      throw new Error("A page with this slug already exists.");
    }
    throw new Error(error.message);
  }
}

export async function deleteStorePage(
  db: SupabaseClient,
  tenantId: string,
  pageId: string,
) {
  const { error } = await db
    .from("store_pages")
    .delete()
    .eq("id", pageId)
    .eq("tenant_id", tenantId);

  if (error) throw new Error(error.message);
}

export async function getPublishedStorePageBySlug(
  tenantId: string,
  pageSlug: string,
) {
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("store_pages")
    .select(
      "id, title, slug, body, meta_title, meta_description, footer_group, show_in_footer, status, is_active, sort_order, updated_at",
    )
    .eq("tenant_id", tenantId)
    .eq("slug", pageSlug)
    .eq("status", "published")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[store_pages]", error.message);
    return null;
  }

  return (data as StorePageRecord | null) ?? null;
}

export async function getFooterStorePages(
  tenantId: string,
): Promise<FooterPageLink[]> {
  return getFooterStorePagesCached(tenantId);
}

const getFooterStorePagesCached = cache(
  async (tenantId: string): Promise<FooterPageLink[]> => {
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("store_pages")
    .select("id, title, slug, footer_group")
    .eq("tenant_id", tenantId)
    .eq("status", "published")
    .eq("is_active", true)
    .eq("show_in_footer", true)
    .neq("footer_group", "none")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    console.error("[store_pages footer]", error.message);
    return [];
  }

  return (data ?? []) as FooterPageLink[];
  },
);
