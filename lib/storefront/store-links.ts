import { storePath } from "@/lib/routes/store-routes";

export function storeHomePath(tenantSlug: string) {
  return storePath(tenantSlug);
}

export function storeCategoriesPath(tenantSlug: string) {
  return storePath(tenantSlug, "categories");
}

export function storeCategoryPath(
  tenantSlug: string,
  categorySlug: string,
) {
  return storePath(tenantSlug, `categories/${categorySlug}`);
}

export function storeCollectionsPath(tenantSlug: string) {
  return storePath(tenantSlug, "collections");
}

export function storeCollectionPath(
  tenantSlug: string,
  collectionSlug: string,
) {
  return storePath(tenantSlug, `collections/${collectionSlug}`);
}

export function storeProductPath(
  tenantSlug: string,
  productSlug: string,
  categorySlug?: string | null,
) {
  const category = categorySlug?.trim() || "all";
  return storePath(tenantSlug, `categories/${category}/${productSlug}`);
}

export function storeSearchPath(tenantSlug: string, query?: string) {
  const base = storePath(tenantSlug, "search");
  const q = query?.trim();
  if (!q) return base;
  return `${base}?q=${encodeURIComponent(q)}`;
}

export function storeCheckoutPath(tenantSlug: string) {
  return storePath(tenantSlug, "checkout");
}

export function storeCheckoutConfirmationPath(
  tenantSlug: string,
  orderNumber?: string,
) {
  const base = storePath(tenantSlug, "checkout/confirmation");
  if (!orderNumber?.trim()) return base;
  return `${base}?order=${encodeURIComponent(orderNumber.trim())}`;
}

export function storeCheckoutPaymentCallbackPath(
  tenantSlug: string,
  orderId: string,
) {
  const base = storePath(tenantSlug, "checkout/payment-callback");
  return `${base}?orderId=${encodeURIComponent(orderId)}`;
}

export function storeOrdersPath(tenantSlug: string) {
  return storePath(tenantSlug, "orders");
}

export function storeOrderDetailPath(
  tenantSlug: string,
  orderNumber: string,
) {
  return storePath(
    tenantSlug,
    `orders/${encodeURIComponent(orderNumber.trim())}`,
  );
}

export function businessOrderDetailPath(
  tenantSlug: string,
  orderNumber: string,
) {
  return `/business/${tenantSlug}/orders/${encodeURIComponent(orderNumber.trim())}`;
}

export function categorySlugFromRelation(
  categories:
    | { slug?: string }
    | { slug?: string }[]
    | null
    | undefined,
): string | null {
  if (!categories) return null;
  if (Array.isArray(categories)) {
    return categories[0]?.slug ?? null;
  }
  return categories.slug ?? null;
}
