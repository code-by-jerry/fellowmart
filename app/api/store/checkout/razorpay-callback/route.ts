import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role-client";
import { fulfillPaidOrder } from "@/lib/checkout/fulfill-order";
import { verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay-server";
import { storeCheckoutConfirmationPath } from "@/lib/storefront/store-links";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { normalizeTenantSlug } from "@/lib/utils/tenant";

function readField(
  source: FormData | URLSearchParams,
  key: string,
): string | null {
  const value = source.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function verifyAndFulfill(input: {
  tenantSlug: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const valid = verifyRazorpayPaymentSignature({
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySignature: input.razorpaySignature,
  });

  if (!valid) {
    throw new Error("Payment verification failed.");
  }

  const storefront = await getStorefrontContext(input.tenantSlug);
  if (!storefront) {
    throw new Error("Store not found.");
  }

  const service = createServiceRoleClient();
  const { data: order } = await service
    .from("orders")
    .select("id, order_number, customer_email, customer_name, user_id")
    .eq("id", input.orderId)
    .eq("tenant_id", storefront.tenantId)
    .maybeSingle();

  if (!order) {
    throw new Error("Order not found.");
  }

  const { data: transaction } = await service
    .from("transactions")
    .select("razorpay_order_id")
    .eq("order_id", input.orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (
    transaction?.razorpay_order_id &&
    transaction.razorpay_order_id !== input.razorpayOrderId
  ) {
    throw new Error("Payment does not match this order.");
  }

  await fulfillPaidOrder(service, {
    orderId: input.orderId,
    tenantId: storefront.tenantId,
    razorpayPaymentId: input.razorpayPaymentId,
    razorpayOrderId: input.razorpayOrderId,
    paymentResponse: {
      razorpay_order_id: input.razorpayOrderId,
      razorpay_payment_id: input.razorpayPaymentId,
      razorpay_signature: input.razorpaySignature,
    },
    customerEmail: order.customer_email as string,
    customerName: order.customer_name as string,
    userId: order.user_id as string | null,
  });

  return order.order_number as string;
}

function redirectToConfirmation(tenantSlug: string, orderNumber: string) {
  const path = storeCheckoutConfirmationPath(tenantSlug, orderNumber);
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return NextResponse.redirect(new URL(path, base), 303);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tenantSlug = normalizeTenantSlug(url.searchParams.get("tenant") ?? "");
    const orderId = url.searchParams.get("orderId")?.trim() ?? "";
    const razorpayOrderId = readField(url.searchParams, "razorpay_order_id");
    const razorpayPaymentId = readField(url.searchParams, "razorpay_payment_id");
    const razorpaySignature = readField(url.searchParams, "razorpay_signature");

    if (
      !tenantSlug ||
      !orderId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        { error: "Incomplete payment callback." },
        { status: 400 },
      );
    }

    const orderNumber = await verifyAndFulfill({
      tenantSlug,
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    return redirectToConfirmation(tenantSlug, orderNumber);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Payment verification failed.";
    console.error("[checkout/razorpay-callback GET]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const tenantSlug = normalizeTenantSlug(url.searchParams.get("tenant") ?? "");
    const orderId = url.searchParams.get("orderId")?.trim() ?? "";

    const formData = await request.formData();
    const razorpayOrderId = readField(formData, "razorpay_order_id");
    const razorpayPaymentId = readField(formData, "razorpay_payment_id");
    const razorpaySignature = readField(formData, "razorpay_signature");

    if (
      !tenantSlug ||
      !orderId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        { error: "Incomplete payment callback." },
        { status: 400 },
      );
    }

    const orderNumber = await verifyAndFulfill({
      tenantSlug,
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    return redirectToConfirmation(tenantSlug, orderNumber);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Payment verification failed.";
    console.error("[checkout/razorpay-callback POST]", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
