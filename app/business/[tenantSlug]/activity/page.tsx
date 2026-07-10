import { requireTenantManager } from "@/lib/auth/business-access";
import { ActivityLogList } from "@/components/portal/ActivityLogList";
import type { ActivityLog } from "@/lib/activity/types";

export default async function BusinessActivityPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data } = await supabase
    .from("activity_logs")
    .select(
      "id, scope, tenant_id, actor_id, actor_email, action, entity_type, entity_id, summary, meta, created_at",
    )
    .eq("scope", "tenant")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-gray-500">
        Store activity — settings changes, plan updates, and team requests.
      </p>
      <ActivityLogList logs={(data as ActivityLog[] | null) ?? []} />
    </div>
  );
}
