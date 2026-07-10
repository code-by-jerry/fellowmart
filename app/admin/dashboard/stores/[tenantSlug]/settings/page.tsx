import { redirect } from "next/navigation";
import { StoreSettingsContent } from "@/components/admin/StoreSettingsContent";
import { getAdminDataClient } from "@/lib/admin/auth";
import { getStorePlanOptions } from "@/lib/admin/store-plans";
import { normalizeTenantSlug } from "@/lib/utils/tenant";

async function getTenantSettings(tenantSlug: string) {
  const db = await getAdminDataClient();

  const { data: tenant, error: tenantError } = await db
    .from("tenants")
    .select(
      "id, name, slug, is_active, onboarding_status, subscriptions(status, plan_name)",
    )
    .eq("slug", normalizeTenantSlug(tenantSlug))
    .maybeSingle();

  if (tenantError || !tenant) {
    redirect("/admin/dashboard/stores?error=Tenant not found");
  }

  const { data: tenantMemberships, error: membershipsError } = await db
    .from("tenant_memberships")
    .select("id, role, user_id")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: true });

  if (membershipsError) {
    redirect("/admin/dashboard/stores?error=Could not load members");
  }

  const { data: teamRequests } = await db
    .from("team_access_requests")
    .select("id, member_email, requested_role, status, notes, created_at")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const ownerCount = (tenantMemberships ?? []).filter(
    (row) => row.role === "owner",
  ).length;

  const userIds = (tenantMemberships ?? []).map((row) => row.user_id);
  const { data: profileRows, error: profilesError } =
    userIds.length > 0
      ? await db.from("profiles").select("id, email").in("id", userIds)
      : { data: [], error: null };

  if (profilesError) {
    redirect("/admin/dashboard/stores?error=Could not load member profiles");
  }

  const profileById = new Map(
    (profileRows ?? []).map((profile) => [profile.id, profile.email]),
  );

  const membershipsWithEmail = (tenantMemberships ?? []).map((row) => ({
    ...row,
    email: profileById.get(row.user_id) ?? "unknown",
  }));

  const planOptions = await getStorePlanOptions(db);

  return {
    tenant,
    tenantMemberships: membershipsWithEmail,
    teamRequests: teamRequests ?? [],
    currentUserRole: "admin" as const,
    ownerCount,
    planOptions,
  };
}

export default async function TenantSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenantSlug?: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const resolvedParams = await params;
  const { success, error } = await searchParams;
  const tenantSlug = normalizeTenantSlug(resolvedParams?.tenantSlug ?? "");

  if (!tenantSlug) {
    redirect("/admin/dashboard/stores");
  }

  const {
    tenant,
    tenantMemberships,
    teamRequests,
    currentUserRole,
    ownerCount,
    planOptions,
  } = await getTenantSettings(tenantSlug);

  return (
    <StoreSettingsContent
      tenant={tenant}
      tenantMemberships={tenantMemberships}
      teamRequests={teamRequests}
      currentUserRole={currentUserRole}
      ownerCount={ownerCount}
      planOptions={planOptions}
      success={success}
      error={error}
    />
  );
}
