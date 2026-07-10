import type { StoreCurrencyCode } from "@/lib/currency/currencies";

/** Catalog product snapshot used by cart + wishlist (prices in INR). */
export type StoreProductRef = {
  productId: string;
  variantId?: string | null;
  name: string;
  slug: string;
  categorySlug?: string | null;
  imageUrl?: string | null;
  priceInr: number;
  compareAtPriceInr?: number | null;
  variantLabel?: string | null;
};

export type CartLineItem = StoreProductRef & {
  quantity: number;
  addedAt: string;
};

export type WishlistItem = StoreProductRef & {
  savedAt: string;
};

export type StoreCommerceConfig = {
  tenantId: string;
  tenantSlug: string;
  currency: StoreCurrencyCode;
  fxRate: number;
};
