import { formatMoney } from "@/lib/currency/format";
import type { StoreCurrencyCode } from "@/lib/currency/currencies";

export type StorefrontPricing = {
  currency: StoreCurrencyCode;
  fxRate: number;
};

/** Format catalog INR amount using a storefront display currency + FX rate. */
export function formatStorePrice(
  storefront: StorefrontPricing,
  amountInr: number,
) {
  return formatMoney(amountInr, {
    currency: storefront.currency,
    rate: storefront.fxRate,
    convert: true,
  });
}

export function discountLabel(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return null;
  const pct = Math.round(((compareAt - price) / compareAt) * 100);
  return `${pct}% OFF`;
}
