import type { SupabaseClient } from "@supabase/supabase-js";

export type HeroBannerInput = {
  title: string;
  eyebrow?: string | null;
  description?: string | null;
  cta_label?: string | null;
  desktop_image_url: string;
  mobile_image_url?: string | null;
  product_id?: string | null;
  link_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

export type HeroBannerRecord = {
  id: string;
  tenant_id: string;
  title: string;
  eyebrow?: string | null;
  description?: string | null;
  cta_label: string;
  desktop_image_url: string;
  mobile_image_url?: string | null;
  product_id?: string | null;
  link_url?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type StorefrontHeroBanner = {
  id: string;
  title: string;
  eyebrow: string | null;
  description: string | null;
  cta_label: string;
  desktop_image_url: string;
  mobile_image_url: string | null;
  href: string;
  product_name: string | null;
};

function normalizeHeroBannerInput(input: HeroBannerInput) {
  const title = input.title.trim();
  const desktop = input.desktop_image_url.trim();

  if (!title) {
    throw new Error("Banner title is required.");
  }
  if (!desktop) {
    throw new Error("Desktop banner image is required.");
  }

  const productId = input.product_id?.trim() || null;
  const linkUrl = input.link_url?.trim() || null;

  return {
    title,
    eyebrow: input.eyebrow?.trim() || null,
    description: input.description?.trim() || null,
    cta_label: input.cta_label?.trim() || "Shop Now",
    desktop_image_url: desktop,
    mobile_image_url: input.mobile_image_url?.trim() || null,
    product_id: productId,
    link_url: productId ? null : linkUrl,
    sort_order: Number.isFinite(input.sort_order) ? Number(input.sort_order) : 0,
    is_active: input.is_active ?? true,
  };
}

export async function createHeroBanner(
  db: SupabaseClient,
  tenantId: string,
  input: HeroBannerInput,
) {
  const payload = normalizeHeroBannerInput(input);

  if (payload.product_id) {
    await assertProductBelongsToTenant(db, tenantId, payload.product_id);
  }

  const { data, error } = await db
    .from("hero_banners")
    .insert({
      tenant_id: tenantId,
      ...payload,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function updateHeroBanner(
  db: SupabaseClient,
  tenantId: string,
  bannerId: string,
  input: HeroBannerInput,
) {
  const payload = normalizeHeroBannerInput(input);

  if (payload.product_id) {
    await assertProductBelongsToTenant(db, tenantId, payload.product_id);
  }

  const { error } = await db
    .from("hero_banners")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bannerId)
    .eq("tenant_id", tenantId);

  if (error) throw new Error(error.message);
}

export async function deleteHeroBanner(
  db: SupabaseClient,
  tenantId: string,
  bannerId: string,
) {
  const { error } = await db
    .from("hero_banners")
    .delete()
    .eq("id", bannerId)
    .eq("tenant_id", tenantId);

  if (error) throw new Error(error.message);
}

async function assertProductBelongsToTenant(
  db: SupabaseClient,
  tenantId: string,
  productId: string,
) {
  const { data, error } = await db
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Selected product was not found in this store.");
}

export async function listHeroBanners(
  db: SupabaseClient,
  tenantId: string,
  options?: { activeOnly?: boolean },
) {
  let query = db
    .from("hero_banners")
    .select(
      "id, tenant_id, title, eyebrow, description, cta_label, desktop_image_url, mobile_image_url, product_id, link_url, sort_order, is_active, created_at, updated_at",
    )
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as HeroBannerRecord[];
}

/**
 * Active banners for storefront, with resolved PDP / custom href.
 */
export async function getTenantHeroBanners(
  tenantId: string,
  tenantSlug: string,
  storePathFn: (slug: string, subpath?: string) => string,
): Promise<StorefrontHeroBanner[]> {
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hero_banners")
    .select(
      `
      id,
      title,
      eyebrow,
      description,
      cta_label,
      desktop_image_url,
      mobile_image_url,
      link_url,
      product_id,
      products (
        id,
        slug,
        name,
        is_active,
        status,
        categories ( slug )
      )
    `,
    )
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[hero_banners]", error.message);
    return [];
  }

  const categoriesFallback = storePathFn(tenantSlug, "categories");

  return (data ?? []).map((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    const category = product?.categories
      ? Array.isArray(product.categories)
        ? product.categories[0]
        : product.categories
      : null;

    let href = categoriesFallback;
    let productName: string | null = null;

    if (
      product &&
      product.slug &&
      product.is_active !== false &&
      product.status !== "archived"
    ) {
      const categorySlug =
        typeof category?.slug === "string" && category.slug
          ? category.slug
          : "all";
      href = storePathFn(
        tenantSlug,
        `categories/${categorySlug}/${product.slug}`,
      );
      productName = product.name ?? null;
    } else if (typeof row.link_url === "string" && row.link_url.trim()) {
      href = row.link_url.trim();
    }

    return {
      id: row.id as string,
      title: row.title as string,
      eyebrow: (row.eyebrow as string | null) ?? null,
      description: (row.description as string | null) ?? null,
      cta_label: (row.cta_label as string) || "Shop Now",
      desktop_image_url: row.desktop_image_url as string,
      mobile_image_url: (row.mobile_image_url as string | null) ?? null,
      href,
      product_name: productName,
    };
  });
}
