import type { StoreProductRef } from "@/lib/storefront/commerce-types";

/** Build a cart/wishlist product snapshot from catalog or card props (server-safe). */
export function toStoreProductRef(input: {
  id?: string | null;
  productId?: string | null;
  name: string;
  slug: string;
  category_slug?: string | null;
  categorySlug?: string | null;
  featured_image_url?: string | null;
  imageUrl?: string | null;
  price: number;
  compare_at_price?: number | null;
  compareAtPriceInr?: number | null;
  variantLabel?: string | null;
  variantId?: string | null;
}): StoreProductRef {
  const productId = input.productId || input.id || `slug:${input.slug}`;

  return {
    productId,
    variantId: input.variantId ?? null,
    name: input.name,
    slug: input.slug,
    categorySlug: input.categorySlug ?? input.category_slug ?? null,
    imageUrl: input.imageUrl ?? input.featured_image_url ?? null,
    priceInr: Number(input.price) || 0,
    compareAtPriceInr:
      input.compareAtPriceInr != null
        ? Number(input.compareAtPriceInr)
        : input.compare_at_price != null
          ? Number(input.compare_at_price)
          : null,
    variantLabel: input.variantLabel ?? null,
  };
}
