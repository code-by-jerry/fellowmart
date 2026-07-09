import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-server";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const tenantSlug = String(form.get("tenant_slug") ?? "").trim();
    const membershipId = String(form.get("membership_id") ?? "").trim();
    const memberRole = String(form.get("member_role") ?? "staff").trim();

    const supabase = await createAdminClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return redirectTo(request, "/admin/login");

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", normalizeTenantSlug(tenantSlug))
      .maybeSingle();

    if (tenantError || !tenant)
      return redirectTo(
        request,
        "/admin/dashboard/stores?error=Tenant not found",
      );

    const { data: currentUserMembership, error: currErr } = await supabase
      .from("tenant_memberships")
      .select("role")
      .eq("tenant_id", tenant.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      currErr ||
      !currentUserMembership ||
      !["owner", "admin"].includes(currentUserMembership.role)
    ) {
      return redirectTo(request, "/admin/dashboard/stores?error=Access denied");
    }

    const { data: targetMembership, error: targetMembershipError } =
      await supabase
        .from("tenant_memberships")
        .select("id, role")
        .eq("id", membershipId)
        .eq("tenant_id", tenant.id)
        .maybeSingle();

    if (targetMembershipError || !targetMembership)
      return redirectTo(
        request,
        "/admin/dashboard/stores?error=Membership not found",
      );

    if (targetMembership.role === "owner" && memberRole !== "owner") {
      const { data: owners } = await supabase
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

    if (memberRole === "owner" && currentUserMembership.role !== "owner") {
      return redirectTo(
        request,
        "/admin/dashboard/stores?error=Only owners can assign owner role",
      );
    }

    const { error: updateError } = await supabase
      .from("tenant_memberships")
      .update({ role: memberRole })
      .eq("id", membershipId)
      .eq("tenant_id", tenant.id);

    if (updateError)
      return redirectTo(
        request,
        `/admin/dashboard/stores/${tenantSlug}/settings?error=Could not update member role`,
      );

    return redirectTo(
      request,
      `/admin/dashboard/stores/${tenantSlug}/settings?success=Member role updated`,
    );
  } catch (err: any) {
    console.error(
      "Error in /api/admin/tenants/members/update-role:",
      err?.message ?? err,
    );
    return new NextResponse(
      JSON.stringify({ error: err?.message ?? "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
