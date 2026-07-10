export const FREE_SHIPPING_THRESHOLD_INR = 499;
export const FLAT_SHIPPING_INR = 49;

export function calculateShippingInr(subtotalInr: number): number {
  if (subtotalInr <= 0) return 0;
  return subtotalInr >= FREE_SHIPPING_THRESHOLD_INR ? 0 : FLAT_SHIPPING_INR;
}
