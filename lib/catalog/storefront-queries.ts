import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

export type StorefrontProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  long_description?: string | null;
  brand?: string | null;
  subtitle?: string | null;
  price: number;
  compare_at_price?: number | null;
  discount_percent?: number;
  featured_image_url?: string | null;
  images?: unknown;
  has_variants?: boolean;
  category_id?: string | null;
  categories?: { slug?: string } | { slug?: string }[] | null;
  tags?: string[] | null;
  status?: string;
  is_active?: boolean;
};

async function fetchTenantProductsByCategory(
  tenantId: string,
  categorySlug: string,
) {
  const supabase = await createClient();

  const { data: allCategories } = await supabase
    .from("categories")
    .select("id, name, slug, icon_name")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order");

  const category = (allCategories ?? []).find(
    (entry) => entry.slug === categorySlug,
  );

  if (!category) return null;

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, slug, sku, description, brand, price, compare_at_price, discount_percent, featured_image_url, has_variants, is_active, status, tags",
    )
    .eq("tenant_id", tenantId)
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return {
    category,
    products: (products ?? []) as StorefrontProduct[],
    allCategories: allCategories ?? [],
  };
}

export const getTenantProductsByCategory = cache(fetchTenantProductsByCategory);

export async function getTenantProductDetail(
  tenantId: string,
  categorySlug: string,
  productSlug: string,
) {
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("tenant_id", tenantId)
    .eq("slug", categorySlug)
    .maybeSingle();

  if (!category) return null;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("category_id", category.id)
    .eq("slug", productSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) return null;

  const [
    { data: variants },
    { data: options },
    { data: attributes },
  ] = await Promise.all([
    supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("position"),
    supabase
      .from("product_options")
      .select("id, name, position, product_option_values(id, value, position, swatch_color, swatch_image_url)")
      .eq("product_id", product.id)
      .order("position"),
    supabase
      .from("product_attributes")
      .select("attribute_key, attribute_value, group_name, sort_order")
      .eq("product_id", product.id)
      .order("sort_order"),
  ]);

  const { data: related } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_at_price, featured_image_url, categories(slug)")
    .eq("tenant_id", tenantId)
    .eq("category_id", category.id)
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(4);

  return {
    category,
    product: product as StorefrontProduct & Record<string, unknown>,
    variants: variants ?? [],
    options: options ?? [],
    attributes: attributes ?? [],
    related: related ?? [],
  };
}

export async function getTenantFeaturedProducts(tenantId: string, limit = 6) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select(
      "id, name, slug, price, compare_at_price, featured_image_url, is_featured, category_id, categories(slug)",
    )
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => {
    const categories = row.categories as
      | { slug?: string }
      | { slug?: string }[]
      | null;
    const categorySlug = Array.isArray(categories)
      ? categories[0]?.slug
      : categories?.slug;

    return {
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      price: Number(row.price),
      compare_at_price: row.compare_at_price as number | null,
      featured_image_url: row.featured_image_url as string | null,
      category_id: row.category_id as string | null,
      category_slug: categorySlug ?? null,
    };
  });
}

export async function getTenantBrands(tenantId: string, limit = 12) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("brands")
    .select("id, name, slug, logo_url")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order")
    .order("name")
    .limit(limit);

  return data ?? [];
}

export function formatPrice(amount: number, currency = "INR") {
  // Legacy helper — prefer formatStorePrice / formatMoney with FX rate
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "INR" || currency === "AED" ? 0 : 2,
  }).format(amount);
}

export { discountLabel } from "@/lib/storefront/pricing";

export async function getTenantCollections(tenantId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("collections")
    .select("id, name, slug, description, image_url, sort_order")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  return data ?? [];
}

async function fetchTenantProductsByCollection(
  tenantId: string,
  collectionSlug: string,
) {
  const supabase = await createClient();

  const { data: collection } = await supabase
    .from("collections")
    .select("id, name, slug, description, image_url")
    .eq("tenant_id", tenantId)
    .eq("slug", collectionSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!collection) return null;

  const { data: links } = await supabase
    .from("product_collections")
    .select("product_id, sort_order")
    .eq("collection_id", collection.id)
    .order("sort_order");

  const productIds = (links ?? []).map((row) => row.product_id as string);
  if (!productIds.length) {
    return { collection, products: [] as StorefrontProduct[] };
  }

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, slug, sku, description, brand, price, compare_at_price, discount_percent, featured_image_url, has_variants, is_active, status, tags, categories(slug)",
    )
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .in("id", productIds);

  const order = new Map(productIds.map((id, index) => [id, index]));
  const sorted = (products ?? [])
    .slice()
    .sort(
      (a, b) =>
        (order.get(a.id as string) ?? 0) - (order.get(b.id as string) ?? 0),
    );

  return {
    collection,
    products: sorted as StorefrontProduct[],
  };
}

export const getTenantProductsByCollection = cache(
  fetchTenantProductsByCollection,
);

async function fetchSearchTenantProducts(tenantId: string, rawQuery: string) {
  const q = rawQuery.trim();
  if (!q) return [] as StorefrontProduct[];

  const supabase = await createClient();
  const term = `%${q}%`;
  const select =
    "id, name, slug, sku, description, brand, price, compare_at_price, discount_percent, featured_image_url, has_variants, is_active, status, tags, categories(slug)";

  const { data: textMatches } = await supabase
    .from("products")
    .select(select)
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .or(
      `name.ilike.${term},brand.ilike.${term},sku.ilike.${term},description.ilike.${term}`,
    )
    .order("created_at", { ascending: false })
    .limit(60);

  const byId = new Map<string, StorefrontProduct>();

  for (const row of textMatches ?? []) {
    byId.set(row.id as string, row as StorefrontProduct);
  }

  if (byId.size < 40) {
    const lower = q.toLowerCase();
    const { data: tagCandidates } = await supabase
      .from("products")
      .select(select)
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .not("tags", "is", null)
      .order("created_at", { ascending: false })
      .limit(80);

    for (const row of tagCandidates ?? []) {
      const id = row.id as string;
      if (byId.has(id)) continue;
      const tags = (row.tags ?? []) as string[];
      if (tags.some((tag) => String(tag).toLowerCase().includes(lower))) {
        byId.set(id, row as StorefrontProduct);
      }
    }
  }

  return Array.from(byId.values());
}

export const searchTenantProducts = cache(fetchSearchTenantProducts);

export async function getTenantDealProducts(tenantId: string, limit = 6) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select(
      "id, name, slug, price, compare_at_price, featured_image_url, category_id, categories(slug)",
    )
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .not("compare_at_price", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  return (data ?? [])
    .filter((row) => Number(row.compare_at_price) > Number(row.price))
    .slice(0, limit)
    .map((row) => {
      const categories = row.categories as
        | { slug?: string }
        | { slug?: string }[]
        | null;
      const categorySlug = Array.isArray(categories)
        ? categories[0]?.slug
        : categories?.slug;

      return {
        id: row.id as string,
        name: row.name as string,
        slug: row.slug as string,
        price: Number(row.price),
        compare_at_price: row.compare_at_price as number | null,
        featured_image_url: row.featured_image_url as string | null,
        category_slug: categorySlug ?? null,
      };
    });
}

/** Resolve product PDP path when category segment may be missing or wrong. */
export async function getTenantProductBySlug(
  tenantId: string,
  productSlug: string,
) {
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, slug, name, category_id, categories(slug)")
    .eq("tenant_id", tenantId)
    .eq("slug", productSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) return null;

  const categories = product.categories as
    | { slug?: string }
    | { slug?: string }[]
    | null;
  const categorySlug = Array.isArray(categories)
    ? categories[0]?.slug
    : categories?.slug;

  return {
    id: product.id as string,
    slug: product.slug as string,
    name: product.name as string,
    category_slug: categorySlug ?? null,
  };
}
