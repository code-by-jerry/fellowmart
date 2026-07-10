import { getAdminDataClient } from "@/lib/admin/auth";
import { ActivityLogList } from "@/components/portal/ActivityLogList";
import type { ActivityLog } from "@/lib/activity/types";

export default async function PlatformActivityPage() {
  const db = await getAdminDataClient();
  const { data } = await db
    .from("activity_logs")
    .select(
      "id, scope, tenant_id, actor_id, actor_email, action, entity_type, entity_id, summary, meta, created_at",
    )
    .eq("scope", "platform")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-gray-500">
        Platform events — applications, team requests, tenant changes, and more.
      </p>
      <ActivityLogList logs={(data as ActivityLog[] | null) ?? []} />
    </div>
  );
}
