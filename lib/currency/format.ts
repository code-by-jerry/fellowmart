import {
  getCurrencyMeta,
  type StoreCurrencyCode,
  normalizeCurrency,
} from "@/lib/currency/currencies";
import { convertAmount } from "@/lib/currency/rates";

export type MoneyFormatOptions = {
  currency?: string | null;
  /** FX rate from base (INR) → display currency. Default 1. */
  rate?: number;
  convert?: boolean;
};

/**
 * Format a catalog amount (stored in INR) for storefront display.
 */
export function formatMoney(
  amount: number,
  options: MoneyFormatOptions = {},
): string {
  const currency = normalizeCurrency(options.currency);
  const meta = getCurrencyMeta(currency);
  const rate = options.rate ?? 1;
  const shouldConvert = options.convert !== false;
  const value =
    shouldConvert && currency !== "INR"
      ? amount * (rate > 0 ? rate : 1)
      : amount;

  try {
    return new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "INR" || currency === "AED" ? 0 : 2,
      minimumFractionDigits: currency === "INR" || currency === "AED" ? 0 : 2,
    }).format(value);
  } catch {
    return `${meta.symbol}${value.toFixed(2)}`;
  }
}

/** @deprecated Prefer formatMoney with tenant currency context */
export function formatPrice(amount: number, currency = "USD") {
  return formatMoney(amount, {
    currency: normalizeCurrency(currency),
    rate: 1,
    convert: false,
  });
}

export function convertAndFormat(
  amountInr: number,
  displayCurrency: StoreCurrencyCode,
  rates: Record<string, number>,
) {
  const converted = convertAmount(amountInr, displayCurrency, rates);
  return formatMoney(converted, {
    currency: displayCurrency,
    rate: 1,
    convert: false,
  });
}
