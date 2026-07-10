import type { SupabaseClient } from "@supabase/supabase-js";
import {
  FALLBACK_SUBSCRIPTION_PLANS,
  formatPlanLabel as formatPlanLabelFromPlans,
} from "@/lib/subscriptions/plan-utils";
import { listSubscriptionPlans } from "@/lib/subscriptions/plans";
import type { SubscriptionPlan } from "@/lib/types/subscription-plan";

/** @deprecated Use listSubscriptionPlans() — kept for type compatibility */
export const STORE_PLAN_OPTIONS = FALLBACK_SUBSCRIPTION_PLANS.map((plan) => ({
  value: plan.slug,
  label: plan.name,
  price: plan.price_display,
}));

export async function getStorePlanOptions(
  db: SupabaseClient,
): Promise<SubscriptionPlan[]> {
  return listSubscriptionPlans(db, { activeOnly: true });
}

export function getPlanLabel(
  planName?: string | null,
  plans: SubscriptionPlan[] = FALLBACK_SUBSCRIPTION_PLANS,
) {
  return formatPlanLabelFromPlans(planName ?? "starter", plans);
}

export function getPlanPrice(
  planName?: string | null,
  plans: SubscriptionPlan[] = FALLBACK_SUBSCRIPTION_PLANS,
) {
  const plan =
    plans.find((item) => item.slug === planName) ??
    FALLBACK_SUBSCRIPTION_PLANS.find((item) => item.slug === planName);
  return plan?.price_display ?? "Free";
}
