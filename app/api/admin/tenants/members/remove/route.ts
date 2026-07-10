import { NextResponse } from "next/server";
import { requirePlatformAdminTenant } from "@/lib/admin/auth";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const tenantSlug = String(form.get("tenant_slug") ?? "").trim();
    const membershipId = String(form.get("membership_id") ?? "").trim();

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

    const { data: membership, error: membershipError } = await db
      .from("tenant_memberships")
      .select("id, role")
      .eq("id", membershipId)
      .eq("tenant_id", tenant.id)
      .maybeSingle();

    if (membershipError || !membership) {
      return redirectTo(
        request,
        "/admin/dashboard/stores?error=Membership not found",
      );
    }

    if (membership.role === "owner") {
      const { data: owners } = await db
        .from("tenant_memberships")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("role", "owner");

      if (!owners || owners.length <= 1) {
        return redirectTo(
          request,
          "/admin/dashboard/stores?error=Cannot remove the last owner",
        );
      }
    }

    const { error: deleteError } = await db
      .from("tenant_memberships")
      .delete()
      .eq("id", membershipId)
      .eq("tenant_id", tenant.id);

    if (deleteError) {
      return redirectTo(
        request,
        `/admin/dashboard/stores/${normalizedSlug}/settings?error=Could not remove member`,
      );
    }

    return redirectTo(
      request,
      `/admin/dashboard/stores/${normalizedSlug}/settings?success=Member removed`,
    );
  } catch (err: unknown) {
    console.error(
      "Error in /api/admin/tenants/members/remove:",
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
