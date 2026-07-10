export const STORE_CURRENCIES = [
  { code: "INR", label: "Indian Rupee", symbol: "₹", locale: "en-IN" },
  { code: "USD", label: "US Dollar", symbol: "$", locale: "en-US" },
  { code: "EUR", label: "Euro", symbol: "€", locale: "de-DE" },
  { code: "AED", label: "UAE Dirham", symbol: "AED", locale: "en-AE" },
] as const;

export type StoreCurrencyCode = (typeof STORE_CURRENCIES)[number]["code"];

/** Catalog prices are authored/stored in this base currency. */
export const BASE_CURRENCY: StoreCurrencyCode = "INR";

export function isStoreCurrency(value: unknown): value is StoreCurrencyCode {
  return (
    typeof value === "string" &&
    STORE_CURRENCIES.some((c) => c.code === value)
  );
}

export function getCurrencyMeta(code: string) {
  return (
    STORE_CURRENCIES.find((c) => c.code === code) ??
    STORE_CURRENCIES.find((c) => c.code === BASE_CURRENCY)!
  );
}

export function normalizeCurrency(value: unknown): StoreCurrencyCode {
  return isStoreCurrency(value) ? value : BASE_CURRENCY;
}
