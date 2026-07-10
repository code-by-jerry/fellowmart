import type { SupabaseClient } from "@supabase/supabase-js";

type OrderTransactionRow = {
  order_id: string;
  payment_method: string | null;
  status: string | null;
  razorpay_payment_id?: string | null;
  created_at?: string;
};

export type TenantOrderSummary = {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  created_at: string;
  payment_method: string | null;
  payment_status: string | null;
  razorpay_payment_id: string | null;
};

export async function listTenantOrders(
  db: SupabaseClient,
  tenantId: string,
): Promise<TenantOrderSummary[]> {
  const { data: orders, error } = await db
    .from("orders")
    .select(
      "id, order_number, status, customer_name, customer_email, total_amount, created_at",
    )
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !orders?.length) return [];

  const orderIds = orders.map((order) => order.id as string);
  const { data: transactions } = await db
    .from("transactions")
    .select(
      "order_id, payment_method, status, razorpay_payment_id, created_at",
    )
    .in("order_id", orderIds)
    .order("created_at", { ascending: false });

  const txByOrder = new Map<string, OrderTransactionRow>();
  for (const tx of transactions ?? []) {
    const orderId = tx.order_id as string;
    if (!txByOrder.has(orderId)) {
      txByOrder.set(orderId, tx);
    }
  }

  return orders.map((order) => {
    const tx = txByOrder.get(order.id as string);
    return {
      id: order.id as string,
      order_number: order.order_number as string,
      status: order.status as string,
      customer_name: order.customer_name as string,
      customer_email: order.customer_email as string,
      total_amount: Number(order.total_amount),
      created_at: order.created_at as string,
      payment_method: (tx?.payment_method as string | null) ?? null,
      payment_status: (tx?.status as string | null) ?? null,
      razorpay_payment_id: (tx?.razorpay_payment_id as string | null) ?? null,
    };
  });
}

export async function listCustomerStoreOrders(
  db: SupabaseClient,
  tenantId: string,
  userId: string,
) {
  const { data: orders, error } = await db
    .from("orders")
    .select(
      "id, order_number, status, total_amount, created_at, shipping_address",
    )
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !orders?.length) return [];

  const orderIds = orders.map((order) => order.id as string);
  const { data: transactions } = await db
    .from("transactions")
    .select("order_id, payment_method, status")
    .in("order_id", orderIds);

  const txByOrder = new Map<string, OrderTransactionRow>();
  for (const tx of transactions ?? []) {
    const orderId = tx.order_id as string;
    if (!txByOrder.has(orderId)) txByOrder.set(orderId, tx);
  }

  return orders.map((order) => ({
    id: order.id as string,
    order_number: order.order_number as string,
    status: order.status as string,
    total_amount: Number(order.total_amount),
    created_at: order.created_at as string,
    payment_method:
      (txByOrder.get(order.id as string)?.payment_method as string | null) ??
      "cod",
    payment_status:
      (txByOrder.get(order.id as string)?.status as string | null) ?? null,
  }));
}
