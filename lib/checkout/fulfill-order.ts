import type { SupabaseClient } from "@supabase/supabase-js";
import { upsertTenantCustomer } from "@/lib/business/tenant-customer-upsert";

type FulfillOrderInput = {
  orderId: string;
  tenantId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  paymentResponse?: Record<string, unknown>;
  customerEmail?: string | null;
  customerName?: string | null;
  userId?: string | null;
};

export async function fulfillPaidOrder(
  supabase: SupabaseClient,
  input: FulfillOrderInput,
): Promise<{ alreadyFulfilled: boolean }> {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, tenant_id, order_number, status, total_amount, customer_email, customer_name, user_id",
    )
    .eq("id", input.orderId)
    .eq("tenant_id", input.tenantId)
    .maybeSingle();

  if (orderError || !order) {
    throw new Error("Order not found.");
  }

  if (order.status === "paid" || order.status === "confirmed") {
    const { data: existingTx } = await supabase
      .from("transactions")
      .select("id")
      .eq("order_id", input.orderId)
      .eq("razorpay_payment_id", input.razorpayPaymentId)
      .maybeSingle();

    if (existingTx || order.status === "paid") {
      return { alreadyFulfilled: true };
    }
  }

  const { data: transaction } = await supabase
    .from("transactions")
    .select("id, status, razorpay_payment_id")
    .eq("order_id", input.orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (transaction?.razorpay_payment_id === input.razorpayPaymentId) {
    return { alreadyFulfilled: true };
  }

  const now = new Date().toISOString();

  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      updated_at: now,
    })
    .eq("id", input.orderId)
    .eq("tenant_id", input.tenantId);

  if (orderUpdateError) {
    throw new Error("Could not update order status.");
  }

  if (transaction?.id) {
    await supabase
      .from("transactions")
      .update({
        status: "captured",
        razorpay_payment_id: input.razorpayPaymentId,
        razorpay_order_id: input.razorpayOrderId,
        response: input.paymentResponse ?? {},
        updated_at: now,
      })
      .eq("id", transaction.id);
  } else {
    await supabase.from("transactions").insert({
      tenant_id: input.tenantId,
      order_id: input.orderId,
      payment_method: "razorpay",
      razorpay_payment_id: input.razorpayPaymentId,
      razorpay_order_id: input.razorpayOrderId,
      amount: Number(order.total_amount),
      currency: "INR",
      status: "captured",
      response: input.paymentResponse ?? {},
    });
  }

  await decrementOrderStock(supabase, input.orderId);

  const email =
    input.customerEmail ?? (order.customer_email as string | null) ?? null;
  const name =
    input.customerName ?? (order.customer_name as string | null) ?? null;
  const userId = input.userId ?? (order.user_id as string | null) ?? null;

  if (email) {
    await recordCustomerOrderStats(supabase, {
      tenantId: input.tenantId,
      email,
      name,
      userId,
      totalInr: Number(order.total_amount),
    });
  }

  return { alreadyFulfilled: false };
}

async function decrementOrderStock(
  supabase: SupabaseClient,
  orderId: string,
) {
  const now = new Date().toISOString();
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("product_variant_id, quantity")
    .eq("order_id", orderId);

  for (const item of orderItems ?? []) {
    const variantId = item.product_variant_id as string;
    const qty = Number(item.quantity) || 0;
    if (!variantId || qty <= 0) continue;

    const { data: variant } = await supabase
      .from("product_variants")
      .select("stock_quantity, allow_backorder")
      .eq("id", variantId)
      .maybeSingle();

    if (!variant || variant.allow_backorder) continue;

    const currentStock = Number(variant.stock_quantity ?? 0);
    await supabase
      .from("product_variants")
      .update({
        stock_quantity: Math.max(0, currentStock - qty),
        updated_at: now,
      })
      .eq("id", variantId);
  }
}

async function recordCustomerOrderStats(
  supabase: SupabaseClient,
  input: {
    tenantId: string;
    email: string;
    name?: string | null;
    userId?: string | null;
    totalInr: number;
  },
) {
  await upsertTenantCustomer({
    tenantId: input.tenantId,
    userId: input.userId,
    email: input.email,
    name: input.name,
    source: "order",
  });

  const { data: customer } = await supabase
    .from("tenant_customers")
    .select("id, order_count, total_spent")
    .eq("tenant_id", input.tenantId)
    .ilike("email", input.email)
    .maybeSingle();

  if (!customer) return;

  const now = new Date().toISOString();
  await supabase
    .from("tenant_customers")
    .update({
      order_count: (Number(customer.order_count) || 0) + 1,
      total_spent: (Number(customer.total_spent) || 0) + input.totalInr,
      last_order_at: now,
      updated_at: now,
    })
    .eq("id", customer.id);
}

export async function fulfillCodOrder(
  supabase: SupabaseClient,
  input: {
    orderId: string;
    tenantId: string;
    customerEmail: string;
    customerName?: string | null;
    userId?: string | null;
    totalInr: number;
  },
) {
  await decrementOrderStock(supabase, input.orderId);
  await recordCustomerOrderStats(supabase, {
    tenantId: input.tenantId,
    email: input.customerEmail,
    name: input.customerName,
    userId: input.userId,
    totalInr: input.totalInr,
  });
}

export async function markOrderPaymentFailed(
  supabase: SupabaseClient,
  orderId: string,
  tenantId: string,
  response?: Record<string, unknown>,
) {
  await supabase
    .from("orders")
    .update({
      status: "payment_failed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("tenant_id", tenantId);

  const { data: transaction } = await supabase
    .from("transactions")
    .select("id")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (transaction?.id) {
    await supabase
      .from("transactions")
      .update({
        status: "failed",
        response: response ?? {},
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);
  }
}
