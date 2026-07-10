export type CheckoutCartLineInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export type CheckoutShippingAddress = {
  label?: string;
  full_name: string;
  phone: string;
  email?: string;
  address_line1: string;
  address_line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

export type CheckoutPaymentMethod = "cod" | "online";

export type CheckoutRequestBody = {
  tenantSlug: string;
  lines: CheckoutCartLineInput[];
  customerName: string;
  customerEmail: string;
  shippingAddress: CheckoutShippingAddress;
  paymentMethod: CheckoutPaymentMethod;
  notes?: string;
};

export type ValidatedCheckoutLine = {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPriceInr: number;
  lineTotalInr: number;
  slug: string;
  categorySlug: string | null;
};

export type ValidatedCheckoutCart = {
  lines: ValidatedCheckoutLine[];
  subtotalInr: number;
  shippingInr: number;
  taxInr: number;
  discountInr: number;
  totalInr: number;
};

export type CreatedCheckoutOrder = {
  orderId: string;
  orderNumber: string;
  totalInr: number;
  paymentMethod: CheckoutPaymentMethod;
};

export type RazorpayCheckoutSession = {
  keyId: string;
  razorpayOrderId: string;
  amountPaise: number;
  currency: string;
};
