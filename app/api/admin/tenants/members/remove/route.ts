import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-server";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const tenantSlug = String(form.get("tenant_slug") ?? "").trim();
    const membershipId = String(form.get("membership_id") ?? "").trim();

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

    const { data: membership, error: membershipError } = await supabase
      .from("tenant_memberships")
      .select("id, role")
      .eq("id", membershipId)
      .eq("tenant_id", tenant.id)
      .maybeSingle();

    if (membershipError || !membership)
      return redirectTo(
        request,
        "/admin/dashboard/stores?error=Membership not found",
      );

    if (membership.role === "owner") {
      const { data: owners } = await supabase
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

    const { error: deleteError } = await supabase
      .from("tenant_memberships")
      .delete()
      .eq("id", membershipId)
      .eq("tenant_id", tenant.id);

    if (deleteError)
      return redirectTo(
        request,
        `/admin/dashboard/stores/${tenantSlug}/settings?error=Could not remove member`,
      );

    return redirectTo(
      request,
      `/admin/dashboard/stores/${tenantSlug}/settings?success=Member removed`,
    );
  } catch (err: any) {
    console.error(
      "Error in /api/admin/tenants/members/remove:",
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
