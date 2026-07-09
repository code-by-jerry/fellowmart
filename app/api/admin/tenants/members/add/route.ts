import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-server";
import { createServiceRoleClient } from "@/utils/supabase/service-role-client";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const tenantSlug = String(form.get("tenant_slug") ?? "").trim();
    const memberEmail = String(form.get("member_email") ?? "")
      .trim()
      .toLowerCase();
    const memberRole = String(form.get("member_role") ?? "staff").trim();
    const memberPassword = String(form.get("member_password") ?? "").trim();

    const supabase = await createAdminClient();
    const serviceRoleSupabase = createServiceRoleClient();

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
      .select("role")
      .eq("tenant_id", tenant.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      membershipError ||
      !membership ||
      !["owner", "admin"].includes(membership.role)
    ) {
      return redirectTo(request, "/admin/dashboard/stores?error=Access denied");
    }

    let profile = null;
    const { data: existingProfile, error: profileError } =
      await serviceRoleSupabase
        .from("profiles")
        .select("id,email")
        .eq("email", memberEmail)
        .maybeSingle();

    if (profileError) {
      console.error("Profile lookup failed:", profileError);
      return redirectTo(
        request,
        `/admin/dashboard/stores/${tenantSlug}/settings?error=Could not look up user`,
      );
    }

    if (existingProfile) {
      profile = existingProfile;
    } else {
      if (!memberPassword) {
        return redirectTo(
          request,
          `/admin/dashboard/stores/${tenantSlug}/settings?error=Password required for new user`,
        );
      }

      const { data: createData, error: createError } =
        await serviceRoleSupabase.auth.admin.createUser({
          email: memberEmail,
          password: memberPassword,
          email_confirm: true,
        });

      if (createError || !createData?.user) {
        console.error("Invite user creation failed:", createError);
        return redirectTo(
          request,
          `/admin/dashboard/stores/${tenantSlug}/settings?error=Could not create user`,
        );
      }

      profile = {
        id: createData.user.id,
        email: createData.user.email ?? memberEmail,
      };
    }

    const { data: existingMembership } = await serviceRoleSupabase
      .from("tenant_memberships")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("user_id", profile.id)
      .maybeSingle();

    if (existingMembership)
      return redirectTo(
        request,
        `/admin/dashboard/stores/${tenantSlug}/settings?error=User already a member`,
      );

    const { error: insertError } = await serviceRoleSupabase
      .from("tenant_memberships")
      .insert({ tenant_id: tenant.id, user_id: profile.id, role: memberRole });

    if (insertError)
      return redirectTo(
        request,
        `/admin/dashboard/stores/${tenantSlug}/settings?error=Could not add member`,
      );

    return redirectTo(
      request,
      `/admin/dashboard/stores/${tenantSlug}/settings?success=Member added`,
    );
  } catch (err: any) {
    console.error(
      "Error in /api/admin/tenants/members/add:",
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
