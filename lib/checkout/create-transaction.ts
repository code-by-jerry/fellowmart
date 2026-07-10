import type { SupabaseClient } from "@supabase/supabase-js";

export async function createPendingRazorpayTransaction(
  supabase: SupabaseClient,
  input: {
    tenantId: string;
    orderId: string;
    amountInr: number;
    razorpayOrderId: string;
  },
) {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      tenant_id: input.tenantId,
      order_id: input.orderId,
      payment_method: "razorpay",
      razorpay_order_id: input.razorpayOrderId,
      amount: input.amountInr,
      currency: "INR",
      status: "pending",
      response: {},
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[checkout] transaction insert failed:", error);
    throw new Error("Could not start payment session.");
  }

  return data.id as string;
}
