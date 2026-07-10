import { NextResponse } from "next/server";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";
import { BUSINESS_ORDER_STATUSES } from "@/lib/orders/tracking";

type UpdateBody = {
  tenantSlug?: string;
  orderNumber?: string;
  status?: string;
  trackingNumber?: string;
  trackingCarrier?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UpdateBody;
    const tenantSlug = body.tenantSlug?.trim() ?? "";
    const orderNumber = body.orderNumber?.trim() ?? "";
    const status = body.status?.trim() ?? "";
    const trackingNumber = body.trackingNumber?.trim() ?? "";
    const trackingCarrier = body.trackingCarrier?.trim() ?? "";

    if (!tenantSlug || !orderNumber || !status) {
      return NextResponse.json(
        { error: "Tenant slug, order number, and status are required." },
        { status: 400 },
      );
    }

    if (!BUSINESS_ORDER_STATUSES.includes(status as (typeof BUSINESS_ORDER_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    const { data: order } = await session.supabase
      .from("orders")
      .select("id, status")
      .eq("tenant_id", session.tenant.id)
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const now = new Date().toISOString();
    const update: Record<string, unknown> = {
      status,
      tracking_number: trackingNumber || null,
      tracking_carrier: trackingCarrier || null,
      updated_at: now,
    };

    if (status === "shipped") {
      update.shipped_at = now;
    }
    if (status === "delivered") {
      update.delivered_at = now;
      if (!update.shipped_at) update.shipped_at = now;
    }

    const { error } = await session.supabase
      .from("orders")
      .update(update)
      .eq("id", order.id)
      .eq("tenant_id", session.tenant.id);

    if (error) {
      console.error("[business/orders/update]", error);
      return NextResponse.json(
        { error: "Could not update order." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
