import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role-client";
import {
  fulfillPaidOrder,
  markOrderPaymentFailed,
} from "@/lib/checkout/fulfill-order";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay-server";

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        status?: string;
        notes?: Record<string, string>;
      };
    };
    order?: {
      entity?: {
        id?: string;
        notes?: Record<string, string>;
      };
    };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyRazorpayWebhookSignature({ rawBody, signature })) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const event = payload.event ?? "";
  const payment = payload.payload?.payment?.entity;
  const orderNotes =
    payment?.notes ??
    payload.payload?.order?.entity?.notes ??
    {};

  const tenantId = orderNotes.tenant_id;
  const orderId = orderNotes.order_id;
  const razorpayPaymentId = payment?.id;
  const razorpayOrderId = payment?.order_id;

  if (!tenantId || !orderId) {
    return NextResponse.json({ received: true });
  }

  const service = createServiceRoleClient();

  try {
    if (event === "payment.captured" && razorpayPaymentId && razorpayOrderId) {
      await fulfillPaidOrder(service, {
        orderId,
        tenantId,
        razorpayPaymentId,
        razorpayOrderId,
        paymentResponse: payload as unknown as Record<string, unknown>,
      });
    }

    if (
      event === "payment.authorized" &&
      razorpayPaymentId &&
      razorpayOrderId
    ) {
      await fulfillPaidOrder(service, {
        orderId,
        tenantId,
        razorpayPaymentId,
        razorpayOrderId,
        paymentResponse: payload as unknown as Record<string, unknown>,
      });
    }

    if (event === "payment.failed" && razorpayPaymentId) {
      await markOrderPaymentFailed(
        service,
        orderId,
        tenantId,
        payload as unknown as Record<string, unknown>,
      );
    }
  } catch (error) {
    console.error("[razorpay webhook]", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
