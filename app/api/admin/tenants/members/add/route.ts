import { NextResponse } from "next/server";
import { requirePlatformAdminTenant } from "@/lib/admin/auth";
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

    let profile: { id: string; email: string } | null = null;
    const { data: existingProfile, error: profileError } = await db
      .from("profiles")
      .select("id,email")
      .eq("email", memberEmail)
      .maybeSingle();

    if (profileError) {
      console.error("Profile lookup failed:", profileError);
      return redirectTo(
        request,
        `/admin/dashboard/stores/${normalizedSlug}/settings?error=Could not look up user`,
      );
    }

    if (existingProfile) {
      profile = existingProfile;
    } else {
      if (!memberPassword) {
        return redirectTo(
          request,
          `/admin/dashboard/stores/${normalizedSlug}/settings?error=Password required for new user`,
        );
      }

      const { data: createData, error: createError } =
        await db.auth.admin.createUser({
          email: memberEmail,
          password: memberPassword,
          email_confirm: true,
        });

      if (createError || !createData?.user) {
        console.error("Invite user creation failed:", createError);
        return redirectTo(
          request,
          `/admin/dashboard/stores/${normalizedSlug}/settings?error=Could not create user`,
        );
      }

      profile = {
        id: createData.user.id,
        email: createData.user.email ?? memberEmail,
      };
    }

    const { data: existingMembership } = await db
      .from("tenant_memberships")
      .select("id")
      .eq("tenant_id", tenant.id)
      .eq("user_id", profile.id)
      .maybeSingle();

    if (existingMembership) {
      return redirectTo(
        request,
        `/admin/dashboard/stores/${normalizedSlug}/settings?error=User already a member`,
      );
    }

    const { error: insertError } = await db.from("tenant_memberships").insert({
      tenant_id: tenant.id,
      user_id: profile.id,
      role: memberRole,
    });

    if (insertError) {
      return redirectTo(
        request,
        `/admin/dashboard/stores/${normalizedSlug}/settings?error=Could not add member`,
      );
    }

    return redirectTo(
      request,
      `/admin/dashboard/stores/${normalizedSlug}/settings?success=Member added`,
    );
  } catch (err: unknown) {
    console.error(
      "Error in /api/admin/tenants/members/add:",
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
