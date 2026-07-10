import type {
  SubscriptionBillingPeriod,
  SubscriptionPlan,
  SubscriptionPlanInput,
} from "@/lib/types/subscription-plan";

export const FALLBACK_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "fallback-starter",
    slug: "starter",
    name: "Starter",
    description: "Get started with a dedicated storefront and core catalog tools.",
    price_amount: 0,
    price_currency: "INR",
    price_display: "Free",
    billing_period: "free",
    features: ["Dedicated storefront", "Catalog management", "Order dashboard"],
    is_featured: false,
    is_active: true,
    sort_order: 0,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-growth",
    slug: "growth",
    name: "Growth",
    description: "Scale with collections, variants, and priority support.",
    price_amount: 1499,
    price_currency: "INR",
    price_display: "₹1,499/mo",
    billing_period: "monthly",
    features: ["Everything in Starter", "Collections & variants", "Priority support"],
    is_featured: true,
    is_active: true,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-enterprise",
    slug: "enterprise",
    name: "Enterprise",
    description: "Custom onboarding and advanced capabilities for larger teams.",
    price_amount: null,
    price_currency: "INR",
    price_display: "Custom",
    billing_period: "custom",
    features: ["Multi-location", "Custom fields", "Dedicated onboarding"],
    is_featured: false,
    is_active: true,
    sort_order: 2,
    created_at: "",
    updated_at: "",
  },
];

export function normalizePlanRow(row: Record<string, unknown>): SubscriptionPlan {
  const rawFeatures = row.features;
  const features = Array.isArray(rawFeatures)
    ? rawFeatures.map((item) => String(item))
    : typeof rawFeatures === "string"
      ? (JSON.parse(rawFeatures) as string[])
      : [];

  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    price_amount:
      row.price_amount === null || row.price_amount === undefined
        ? null
        : Number(row.price_amount),
    price_currency: String(row.price_currency ?? "INR"),
    price_display: String(row.price_display),
    billing_period: String(row.billing_period ?? "monthly") as SubscriptionBillingPeriod,
    features,
    is_featured: Boolean(row.is_featured),
    is_active: Boolean(row.is_active),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export function formatPlanLabel(
  planName: string | null | undefined,
  plans: SubscriptionPlan[],
): string {
  const plan =
    plans.find((item) => item.slug === planName) ??
    FALLBACK_SUBSCRIPTION_PLANS.find((item) => item.slug === planName);

  if (!plan) return planName ?? "Unknown plan";
  return `${plan.name} · ${plan.price_display}`;
}

export function parseFeaturesInput(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function serializeFeaturesInput(features: string[]): string {
  return features.join("\n");
}

export function toPlanInputFromForm(form: FormData): SubscriptionPlanInput {
  const priceRaw = String(form.get("price_amount") ?? "").trim();
  const priceAmount = priceRaw ? Number(priceRaw) : null;

  return {
    slug: String(form.get("slug") ?? "").trim().toLowerCase(),
    name: String(form.get("name") ?? "").trim(),
    description: String(form.get("description") ?? "").trim() || null,
    price_amount: Number.isFinite(priceAmount) ? priceAmount : null,
    price_currency: String(form.get("price_currency") ?? "INR").trim() || "INR",
    price_display: String(form.get("price_display") ?? "").trim(),
    billing_period: String(
      form.get("billing_period") ?? "monthly",
    ).trim() as SubscriptionBillingPeriod,
    features: parseFeaturesInput(String(form.get("features") ?? "")),
    is_featured: form.get("is_featured") === "on",
    is_active: form.get("is_active") !== "off",
    sort_order: Number(form.get("sort_order") ?? 0),
  };
}

export function toLandingPricingPeriod(plan: SubscriptionPlan): string {
  if (plan.billing_period === "monthly") return "/ month";
  if (plan.billing_period === "yearly") return "/ year";
  if (plan.billing_period === "custom") return "pricing";
  return "";
}
