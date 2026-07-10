import type { SupabaseClient } from "@supabase/supabase-js";
import type { CheckoutShippingAddress } from "@/lib/checkout/types";

export type OrderLineItem = {
  id: string;
  quantity: number;
  unitPriceInr: number;
  lineTotalInr: number;
  productId: string | null;
  productName: string;
  productSlug: string | null;
  variantId: string | null;
  variantName: string | null;
  imageUrl: string | null;
};

export type OrderDetails = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  subtotalInr: number;
  shippingInr: number;
  taxInr: number;
  discountInr: number;
  totalInr: number;
  createdAt: string;
  shippingAddress: CheckoutShippingAddress | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  razorpayPaymentId: string | null;
  items: OrderLineItem[];
};

function parseImageUrl(product: {
  featured_image_url?: string | null;
  images?: unknown;
} | null): string | null {
  if (!product) return null;
  if (product.featured_image_url) return product.featured_image_url;

  const images = product.images;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "url" in first) {
      const url = (first as { url?: string }).url;
      if (url) return url;
    }
  }

  return null;
}

export async function getOrderDetails(
  db: SupabaseClient,
  tenantId: string,
  orderId: string,
): Promise<OrderDetails | null> {
  const { data: order } = await db
    .from("orders")
    .select(
      "id, order_number, status, customer_name, customer_email, subtotal, shipping_amount, tax_amount, discount_amount, total_amount, created_at, shipping_address, tracking_number, tracking_carrier, shipped_at, delivered_at",
    )
    .eq("id", orderId)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (!order) return null;

  const [{ data: items }, { data: transaction }] = await Promise.all([
    db
      .from("order_items")
      .select(
        `
        id,
        quantity,
        unit_price,
        total_price,
        product_variant_id,
        product_variants (
          id,
          name,
          product_id,
          products (
            id,
            name,
            slug,
            featured_image_url,
            images
          )
        )
      `,
      )
      .eq("order_id", orderId),
    db
      .from("transactions")
      .select("payment_method, status, razorpay_payment_id")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const lineItems: OrderLineItem[] = (items ?? []).map((row) => {
    const variant = row.product_variants as
      | {
          id?: string;
          name?: string;
          product_id?: string;
          products?: {
            id?: string;
            name?: string;
            slug?: string;
            featured_image_url?: string | null;
            images?: unknown;
          } | null;
        }
      | null
      | Array<{
          id?: string;
          name?: string;
          product_id?: string;
          products?: {
            id?: string;
            name?: string;
            slug?: string;
            featured_image_url?: string | null;
            images?: unknown;
          } | null;
        }>;

    const variantRow = Array.isArray(variant) ? variant[0] : variant;
    const product = variantRow?.products ?? null;
    const productRow = Array.isArray(product) ? product[0] : product;

    return {
      id: row.id as string,
      quantity: Number(row.quantity) || 0,
      unitPriceInr: Number(row.unit_price) || 0,
      lineTotalInr: Number(row.total_price) || 0,
      productId: (productRow?.id as string | undefined) ?? null,
      productName: (productRow?.name as string | undefined) ?? "Product",
      productSlug: (productRow?.slug as string | undefined) ?? null,
      variantId: (variantRow?.id as string | undefined) ?? null,
      variantName: (variantRow?.name as string | undefined) ?? null,
      imageUrl: parseImageUrl(productRow ?? null),
    };
  });

  return {
    id: order.id as string,
    orderNumber: order.order_number as string,
    status: order.status as string,
    customerName: order.customer_name as string,
    customerEmail: order.customer_email as string,
    subtotalInr: Number(order.subtotal),
    shippingInr: Number(order.shipping_amount),
    taxInr: Number(order.tax_amount),
    discountInr: Number(order.discount_amount),
    totalInr: Number(order.total_amount),
    createdAt: order.created_at as string,
    shippingAddress: (order.shipping_address as CheckoutShippingAddress | null) ?? null,
    trackingNumber: (order.tracking_number as string | null) ?? null,
    trackingCarrier: (order.tracking_carrier as string | null) ?? null,
    shippedAt: (order.shipped_at as string | null) ?? null,
    deliveredAt: (order.delivered_at as string | null) ?? null,
    paymentMethod: (transaction?.payment_method as string | null) ?? null,
    paymentStatus: (transaction?.status as string | null) ?? null,
    razorpayPaymentId: (transaction?.razorpay_payment_id as string | null) ?? null,
    items: lineItems,
  };
}

export async function getOrderDetailsByNumber(
  db: SupabaseClient,
  tenantId: string,
  orderNumber: string,
): Promise<OrderDetails | null> {
  const { data: order } = await db
    .from("orders")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("order_number", orderNumber.trim())
    .maybeSingle();

  if (!order?.id) return null;
  return getOrderDetails(db, tenantId, order.id as string);
}

export async function listOrderItemPreviews(
  db: SupabaseClient,
  orderIds: string[],
): Promise<Map<string, OrderLineItem[]>> {
  const map = new Map<string, OrderLineItem[]>();
  if (!orderIds.length) return map;

  const { data: items } = await db
    .from("order_items")
    .select(
      `
      id,
      order_id,
      quantity,
      unit_price,
      total_price,
      product_variant_id,
      product_variants (
        id,
        name,
        products ( id, name, slug, featured_image_url, images )
      )
    `,
    )
    .in("order_id", orderIds);

  for (const row of items ?? []) {
    const orderId = row.order_id as string;
    const variant = row.product_variants as
      | {
          name?: string;
          products?: {
            name?: string;
            slug?: string;
            featured_image_url?: string | null;
            images?: unknown;
          } | null;
        }
      | null
      | Array<{
          name?: string;
          products?: {
            name?: string;
            slug?: string;
            featured_image_url?: string | null;
            images?: unknown;
          } | null;
        }>;

    const variantRow = Array.isArray(variant) ? variant[0] : variant;
    const product = variantRow?.products ?? null;
    const productRow = Array.isArray(product) ? product[0] : product;

    const line: OrderLineItem = {
      id: row.id as string,
      quantity: Number(row.quantity) || 0,
      unitPriceInr: Number(row.unit_price) || 0,
      lineTotalInr: Number(row.total_price) || 0,
      productId: null,
      productName: (productRow?.name as string | undefined) ?? "Product",
      productSlug: (productRow?.slug as string | undefined) ?? null,
      variantId: null,
      variantName: (variantRow?.name as string | undefined) ?? null,
      imageUrl: parseImageUrl(productRow ?? null),
    };

    const existing = map.get(orderId) ?? [];
    existing.push(line);
    map.set(orderId, existing);
  }

  return map;
}
