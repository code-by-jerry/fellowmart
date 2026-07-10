import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import type { SubscriptionPlan } from "@/lib/types/subscription-plan";
import {
  FALLBACK_SUBSCRIPTION_PLANS,
  normalizePlanRow,
} from "@/lib/subscriptions/plan-utils";

export {
  FALLBACK_SUBSCRIPTION_PLANS,
  formatPlanLabel,
  parseFeaturesInput,
  serializeFeaturesInput,
  toLandingPricingPeriod,
  toPlanInputFromForm,
} from "@/lib/subscriptions/plan-utils";

export async function listSubscriptionPlans(
  db: SupabaseClient,
  options?: { activeOnly?: boolean },
): Promise<SubscriptionPlan[]> {
  let query = db
    .from("subscription_plans")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return options?.activeOnly
      ? FALLBACK_SUBSCRIPTION_PLANS.filter((plan) => plan.is_active)
      : FALLBACK_SUBSCRIPTION_PLANS;
  }

  return data.map((row) => normalizePlanRow(row));
}

export async function getSubscriptionPlanById(
  db: SupabaseClient,
  id: string,
): Promise<SubscriptionPlan | null> {
  const { data, error } = await db
    .from("subscription_plans")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return normalizePlanRow(data);
}

export async function getSubscriptionPlanBySlug(
  db: SupabaseClient,
  slug: string,
): Promise<SubscriptionPlan | null> {
  const { data, error } = await db
    .from("subscription_plans")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return (
      FALLBACK_SUBSCRIPTION_PLANS.find((plan) => plan.slug === slug) ?? null
    );
  }

  return normalizePlanRow(data);
}

export async function getPublicSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const supabase = await createClient();
    return listSubscriptionPlans(supabase, { activeOnly: true });
  } catch {
    return FALLBACK_SUBSCRIPTION_PLANS.filter((plan) => plan.is_active);
  }
}
