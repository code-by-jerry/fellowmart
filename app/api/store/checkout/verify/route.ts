import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role-client";
import { fulfillPaidOrder } from "@/lib/checkout/fulfill-order";
import { verifyRazorpayPaymentSignature } from "@/lib/payments/razorpay-server";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { normalizeTenantSlug } from "@/lib/utils/tenant";

type VerifyBody = {
  tenantSlug?: string;
  orderId?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyBody;
    const tenantSlug = normalizeTenantSlug(body.tenantSlug ?? "");
    const orderId = body.orderId?.trim();
    const razorpayOrderId = body.razorpay_order_id?.trim();
    const razorpayPaymentId = body.razorpay_payment_id?.trim();
    const razorpaySignature = body.razorpay_signature?.trim();

    if (
      !tenantSlug ||
      !orderId ||
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        { error: "Incomplete payment verification payload." },
        { status: 400 },
      );
    }

    const valid = verifyRazorpayPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!valid) {
      return NextResponse.json(
        { error: "Payment verification failed." },
        { status: 400 },
      );
    }

    const storefront = await getStorefrontContext(tenantSlug);
    if (!storefront) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const service = createServiceRoleClient();
    const { data: order } = await service
      .from("orders")
      .select("id, order_number, customer_email, customer_name, user_id")
      .eq("id", orderId)
      .eq("tenant_id", storefront.tenantId)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (user && order.user_id && order.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { data: transaction } = await service
      .from("transactions")
      .select("razorpay_order_id")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (
      transaction?.razorpay_order_id &&
      transaction.razorpay_order_id !== razorpayOrderId
    ) {
      return NextResponse.json(
        { error: "Payment does not match this order." },
        { status: 400 },
      );
    }

    const result = await fulfillPaidOrder(service, {
      orderId,
      tenantId: storefront.tenantId,
      razorpayPaymentId,
      razorpayOrderId,
      paymentResponse: body as Record<string, unknown>,
      customerEmail: order.customer_email as string,
      customerName: order.customer_name as string,
      userId: order.user_id as string | null,
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
      alreadyFulfilled: result.alreadyFulfilled,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Payment verification failed.";
    console.error("[checkout/verify]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
