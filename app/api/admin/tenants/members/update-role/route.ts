import { NextResponse } from "next/server";
import { requirePlatformAdminTenant } from "@/lib/admin/auth";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const tenantSlug = String(form.get("tenant_slug") ?? "").trim();
    const membershipId = String(form.get("membership_id") ?? "").trim();
    const memberRole = String(form.get("member_role") ?? "staff").trim();

    let ctx;
    try {
      ctx = await requirePlatformAdminTenant(tenantSlug);
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : "FORBIDDEN";
      if (code === "UNAUTHORIZED") {
        return redirectTo(request, "/admin/login");
      }
      if (code === "TENANT_NOT_FOUND") {
        return redirectTo(
          request,
          "/admin/dashboard/stores?error=Tenant not found",
        );
      }
      return redirectTo(request, "/admin/dashboard/stores?error=Access denied");
    }

    const { db, tenant, tenantSlug: normalizedSlug } = ctx;

    const { data: targetMembership, error: targetMembershipError } = await db
      .from("tenant_memberships")
      .select("id, role")
      .eq("id", membershipId)
      .eq("tenant_id", tenant.id)
      .maybeSingle();

    if (targetMembershipError || !targetMembership) {
      return redirectTo(
        request,
        "/admin/dashboard/stores?error=Membership not found",
      );
    }

    if (targetMembership.role === "owner" && memberRole !== "owner") {
      const { data: owners } = await db
        .from("tenant_memberships")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("role", "owner");

      if (!owners || owners.length <= 1) {
        return redirectTo(
          request,
          "/admin/dashboard/stores?error=Cannot demote the last owner",
        );
      }
    }

    const { error: updateError } = await db
      .from("tenant_memberships")
      .update({ role: memberRole })
      .eq("id", membershipId)
      .eq("tenant_id", tenant.id);

    if (updateError) {
      return redirectTo(
        request,
        `/admin/dashboard/stores/${normalizedSlug}/settings?error=Could not update member role`,
      );
    }

    return redirectTo(
      request,
      `/admin/dashboard/stores/${normalizedSlug}/settings?success=Member role updated`,
    );
  } catch (err: unknown) {
    console.error(
      "Error in /api/admin/tenants/members/update-role:",
      err instanceof Error ? err.message : err,
    );
    return new NextResponse(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
