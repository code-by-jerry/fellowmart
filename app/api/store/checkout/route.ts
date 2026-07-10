import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role-client";
import { createCheckoutOrder } from "@/lib/checkout/create-order";
import { createPendingRazorpayTransaction } from "@/lib/checkout/create-transaction";
import { fulfillCodOrder } from "@/lib/checkout/fulfill-order";
import type {
  CheckoutPaymentMethod,
  CheckoutRequestBody,
  CheckoutShippingAddress,
} from "@/lib/checkout/types";
import {
  CheckoutValidationError,
  validateCheckoutCart,
} from "@/lib/checkout/validate-cart";
import { getRazorpayConfig, inrToPaise } from "@/lib/payments/razorpay-config";
import { createRazorpayOrder } from "@/lib/payments/razorpay-server";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { normalizeTenantSlug } from "@/lib/utils/tenant";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseShippingAddress(
  raw: CheckoutShippingAddress | undefined,
): CheckoutShippingAddress | null {
  if (!raw) return null;

  const full_name = raw.full_name?.trim();
  const phone = raw.phone?.replace(/\D/g, "") ?? "";
  const address_line1 = raw.address_line1?.trim();
  const city = raw.city?.trim();
  const state = raw.state?.trim();
  const postal_code = raw.postal_code?.trim();

  if (!full_name || !phone || !address_line1 || !city || !state || !postal_code) {
    return null;
  }

  if (phone.length < 10) return null;
  if (!/^\d{6}$/.test(postal_code)) return null;

  return {
    label: raw.label?.trim() || "Home",
    full_name,
    phone,
    email: raw.email?.trim().toLowerCase(),
    address_line1,
    address_line2: raw.address_line2?.trim() || null,
    landmark: raw.landmark?.trim() || null,
    city,
    state,
    postal_code,
    country: raw.country?.trim() || "IN",
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const tenantSlug = normalizeTenantSlug(body.tenantSlug ?? "");
    const customerName = body.customerName?.trim() ?? "";
    const customerEmail = body.customerEmail?.trim().toLowerCase() ?? "";
    const paymentMethod: CheckoutPaymentMethod =
      body.paymentMethod === "online" ? "online" : "cod";
    const shippingAddress = parseShippingAddress(body.shippingAddress);

    if (!tenantSlug) {
      return NextResponse.json({ error: "Store not found." }, { status: 400 });
    }

    if (!customerName) {
      return NextResponse.json(
        { error: "Customer name is required." },
        { status: 400 },
      );
    }

    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 },
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Please complete your delivery address." },
        { status: 400 },
      );
    }

    if (paymentMethod === "online" && !getRazorpayConfig()) {
      return NextResponse.json(
        {
          error:
            "Online payments are not configured. Use Cash on Delivery or contact support.",
        },
        { status: 503 },
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

    const cart = await validateCheckoutCart(
      supabase,
      storefront.tenantId,
      body.lines ?? [],
    );

    const service = createServiceRoleClient();
    const order = await createCheckoutOrder(service, {
      tenantId: storefront.tenantId,
      tenantSlug: storefront.tenantSlug,
      userId: user?.id ?? null,
      customerName,
      customerEmail,
      shippingAddress: {
        ...shippingAddress,
        email: customerEmail,
      },
      paymentMethod,
      notes: body.notes,
      cart,
    });

    if (paymentMethod === "cod") {
      await fulfillCodOrder(service, {
        orderId: order.orderId,
        tenantId: storefront.tenantId,
        customerEmail,
        customerName,
        userId: user?.id ?? null,
        totalInr: order.totalInr,
      });

      return NextResponse.json({
        success: true,
        order,
        cart,
      });
    }

    const razorpayConfig = getRazorpayConfig()!;
    const razorpayOrder = await createRazorpayOrder({
      amountInr: order.totalInr,
      receipt: order.orderNumber,
      notes: {
        tenant_id: storefront.tenantId,
        order_id: order.orderId,
        order_number: order.orderNumber,
      },
    });

    await createPendingRazorpayTransaction(service, {
      tenantId: storefront.tenantId,
      orderId: order.orderId,
      amountInr: order.totalInr,
      razorpayOrderId: razorpayOrder.id,
    });

    return NextResponse.json({
      success: true,
      order,
      cart,
      razorpay: {
        keyId: razorpayConfig.keyId,
        razorpayOrderId: razorpayOrder.id,
        amountPaise: inrToPaise(order.totalInr),
        currency: "INR",
      },
    });
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const message =
      error instanceof Error ? error.message : "Could not complete checkout.";
    console.error("[checkout]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
