import type { SupabaseClient } from "@supabase/supabase-js";
import { generateOrderNumber } from "@/lib/checkout/order-number";
import type {
  CheckoutPaymentMethod,
  CheckoutShippingAddress,
  CreatedCheckoutOrder,
  ValidatedCheckoutCart,
} from "@/lib/checkout/types";

type CreateOrderInput = {
  tenantId: string;
  tenantSlug: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  shippingAddress: CheckoutShippingAddress;
  paymentMethod: CheckoutPaymentMethod;
  notes?: string;
  cart: ValidatedCheckoutCart;
};

export async function createCheckoutOrder(
  supabase: SupabaseClient,
  input: CreateOrderInput,
): Promise<CreatedCheckoutOrder> {
  const orderNumber = generateOrderNumber(input.tenantSlug);
  const paymentNote =
    input.paymentMethod === "cod"
      ? "Payment method: Cash on delivery"
      : "Payment method: Online (pending)";

  const mergedNotes = [paymentNote, input.notes?.trim()]
    .filter(Boolean)
    .join("\n");

  const orderStatus =
    input.paymentMethod === "cod" ? "confirmed" : "pending";

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      tenant_id: input.tenantId,
      order_number: orderNumber,
      user_id: input.userId ?? null,
      customer_email: input.customerEmail.trim().toLowerCase(),
      customer_name: input.customerName.trim(),
      customer_contact: input.customerEmail.trim().toLowerCase(),
      status: orderStatus,
      subtotal: input.cart.subtotalInr,
      shipping_amount: input.cart.shippingInr,
      tax_amount: input.cart.taxInr,
      discount_amount: input.cart.discountInr,
      total_amount: input.cart.totalInr,
      shipping_address: input.shippingAddress,
      billing_address: input.shippingAddress,
      notes: mergedNotes || null,
    })
    .select("id, order_number, total_amount")
    .single();

  if (orderError || !order) {
    console.error("[checkout] order insert failed:", orderError);
    throw new Error("Could not place your order. Please try again.");
  }

  const orderItems = input.cart.lines.map((line) => ({
    order_id: order.id,
    product_variant_id: line.variantId,
    quantity: line.quantity,
    unit_price: line.unitPriceInr,
    total_price: line.lineTotalInr,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("[checkout] order items insert failed:", itemsError);
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error("Could not save order items. Please try again.");
  }

  return {
    orderId: order.id as string,
    orderNumber: order.order_number as string,
    totalInr: Number(order.total_amount),
    paymentMethod: input.paymentMethod,
  };
}
