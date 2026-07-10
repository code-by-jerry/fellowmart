import { createServiceRoleClient } from "@/utils/supabase/service-role-client";
import { cache } from "react";
import {
  BASE_CURRENCY,
  type StoreCurrencyCode,
  normalizeCurrency,
} from "@/lib/currency/currencies";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

type RatesMap = Record<string, number>;

async function fetchRatesFromApi(base: StoreCurrencyCode): Promise<{
  rates: RatesMap;
  source: string;
} | null> {
  // Primary: open.er-api.com (no key, includes AED/INR/USD/EUR)
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = (await res.json()) as {
        result?: string;
        rates?: RatesMap;
      };
      if (json.result === "success" && json.rates) {
        return { rates: json.rates, source: "open.er-api.com" };
      }
    }
  } catch (error) {
    console.error("[currency] open.er-api failed:", error);
  }

  // Fallback: Frankfurter (ECB; may miss AED)
  try {
    const res = await fetch(
      `https://api.frankfurter.dev/v1/latest?base=${base}`,
      { next: { revalidate: 3600 } },
    );
    if (res.ok) {
      const json = (await res.json()) as { rates?: RatesMap };
      if (json.rates) {
        return {
          rates: { ...json.rates, [base]: 1 },
          source: "frankfurter.dev",
        };
      }
    }
  } catch (error) {
    console.error("[currency] frankfurter failed:", error);
  }

  return null;
}

async function readCachedRates(base: StoreCurrencyCode) {
  try {
    const db = createServiceRoleClient();
    const { data } = await db
      .from("currency_rates")
      .select("rates, fetched_at, source")
      .eq("base_currency", base)
      .maybeSingle();
    return data as
      | { rates: RatesMap; fetched_at: string; source: string }
      | null;
  } catch {
    return null;
  }
}

async function writeCachedRates(
  base: StoreCurrencyCode,
  rates: RatesMap,
  source: string,
) {
  try {
    const db = createServiceRoleClient();
    await db.from("currency_rates").upsert({
      base_currency: base,
      rates,
      fetched_at: new Date().toISOString(),
      source,
    });
  } catch (error) {
    console.error("[currency] cache write failed:", error);
  }
}

/**
 * Returns FX rates for converting FROM base currency (INR) TO other codes.
 * Cached in DB for ~6 hours; refreshed from public APIs.
 */
export async function getExchangeRates(
  base: StoreCurrencyCode = BASE_CURRENCY,
): Promise<{ rates: RatesMap; fetchedAt: string | null; source: string }> {
  const cached = await readCachedRates(base);
  if (cached?.rates) {
    const age = Date.now() - new Date(cached.fetched_at).getTime();
    if (age < CACHE_TTL_MS) {
      return {
        rates: { ...cached.rates, [base]: 1 },
        fetchedAt: cached.fetched_at,
        source: cached.source,
      };
    }
  }

  const fresh = await fetchRatesFromApi(base);
  if (fresh) {
    const rates = { ...fresh.rates, [base]: 1 };
    await writeCachedRates(base, rates, fresh.source);
    return {
      rates,
      fetchedAt: new Date().toISOString(),
      source: fresh.source,
    };
  }

  // Stale cache better than nothing
  if (cached?.rates) {
    return {
      rates: { ...cached.rates, [base]: 1 },
      fetchedAt: cached.fetched_at,
      source: `${cached.source} (stale)`,
    };
  }

  // Last resort: identity (no conversion)
  return { rates: { INR: 1, USD: 1, EUR: 1, AED: 1 }, fetchedAt: null, source: "fallback" };
}

export function convertAmount(
  amount: number,
  toCurrency: StoreCurrencyCode,
  rates: RatesMap,
  fromCurrency: StoreCurrencyCode = BASE_CURRENCY,
): number {
  if (!Number.isFinite(amount)) return 0;
  if (fromCurrency === toCurrency) return amount;

  // rates are quoted as: 1 fromCurrency = rates[X] of X
  // If rates are for base=fromCurrency, multiply by rates[to]
  if (fromCurrency === BASE_CURRENCY || rates[toCurrency]) {
    const rate = rates[toCurrency];
    if (typeof rate === "number" && rate > 0) return amount * rate;
  }

  // Cross via base if needed
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];
  if (
    typeof fromRate === "number" &&
    fromRate > 0 &&
    typeof toRate === "number" &&
    toRate > 0
  ) {
    // If rates are vs BASE, amount_in_base = amount / fromRate when from≠base...
    // Our cache is always base=INR, so: amount_inr * rates[to]
    return amount * toRate;
  }

  return amount;
}

export async function getRateTo(
  toCurrency: StoreCurrencyCode,
): Promise<{ rate: number; fetchedAt: string | null; source: string }> {
  return getRateToCached(toCurrency);
}

const getRateToCached = cache(
  async (
    toCurrency: StoreCurrencyCode,
  ): Promise<{ rate: number; fetchedAt: string | null; source: string }> => {
  const currency = normalizeCurrency(toCurrency);
  const { rates, fetchedAt, source } = await getExchangeRates(BASE_CURRENCY);
  return {
    rate: currency === BASE_CURRENCY ? 1 : (rates[currency] ?? 1),
    fetchedAt,
    source,
  };
  },
);
