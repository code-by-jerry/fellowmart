import { requireTenantManager } from "@/lib/auth/business-access";
import { listSubscriptionPlans } from "@/lib/subscriptions/plans";
import { SubscriptionPlansTable } from "@/components/business/SubscriptionPlansTable";

export default async function BusinessSubscriptionPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const [{ data: subscription }, plans] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan_name, status, is_active, created_at")
      .eq("tenant_id", tenant.id)
      .maybeSingle(),
    listSubscriptionPlans(supabase, { activeOnly: true }),
  ]);

  const currentPlanSlug = subscription?.plan_name ?? "starter";

  return (
    <SubscriptionPlansTable
      tenantSlug={tenant.slug}
      currentPlanSlug={currentPlanSlug}
      subscriptionStatus={subscription?.status ?? "trial"}
      subscriptionActive={Boolean(subscription?.is_active)}
      since={subscription?.created_at}
      plans={plans}
    />
  );
}
