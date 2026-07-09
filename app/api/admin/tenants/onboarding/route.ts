import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-server";
import { isPlatformAdminProfile } from "@/lib/auth/platform-admin";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const tenantSlug = String(form.get("tenant_slug") ?? "").trim();
    const onboardingStatus = String(form.get("onboarding_status") ?? "").trim();

    const supabase = await createAdminClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return redirectTo(request, "/admin/login");
    }

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", normalizeTenantSlug(tenantSlug))
      .maybeSingle();

    if (tenantError || !tenant) {
      return redirectTo(
        request,
        "/admin/dashboard/stores?error=Tenant not found",
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from("tenant_memberships")
      .select("id, role")
      .eq("tenant_id", tenant.id)
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, email")
      .eq("id", user.id)
      .maybeSingle();

    const isGlobalAdmin = isPlatformAdminProfile(profile);

    if (membershipError || (!membership && !isGlobalAdmin)) {
      return redirectTo(request, "/admin/dashboard/stores?error=Access denied");
    }

    if (!isGlobalAdmin && !["owner", "admin"].includes(membership?.role)) {
      return redirectTo(request, "/admin/dashboard/stores?error=Access denied");
    }

    const tenantUpdatePayload: any = {
      onboarding_status: onboardingStatus,
      updated_at: new Date().toISOString(),
    };

    if (onboardingStatus === "active" || onboardingStatus === "completed") {
      tenantUpdatePayload.is_active = true;
    }

    if (onboardingStatus === "pending") {
      tenantUpdatePayload.is_active = false;
    }

    const { error: updateError } = await supabase
      .from("tenants")
      .update(tenantUpdatePayload)
      .eq("id", tenant.id);

    if (updateError) {
      return redirectTo(
        request,
        "/admin/dashboard/stores?error=Could not update onboarding status",
      );
    }

    if (onboardingStatus === "active" || onboardingStatus === "completed") {
      const { data: existingSubscription } = await supabase
        .from("subscriptions")
        .select("id, status")
        .eq("tenant_id", tenant.id)
        .maybeSingle();

      if (existingSubscription) {
        await supabase
          .from("subscriptions")
          .update({
            status:
              onboardingStatus === "completed"
                ? "active"
                : existingSubscription.status === "trial"
                  ? "trial"
                  : existingSubscription.status,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("tenant_id", tenant.id);
      } else {
        await supabase.from("subscriptions").insert({
          tenant_id: tenant.id,
          plan_name: "starter",
          status: onboardingStatus === "completed" ? "active" : "trial",
          is_active: true,
        });
      }
    }

    return redirectTo(
      request,
      "/admin/dashboard/stores?success=Onboarding status updated",
    );
  } catch (err: any) {
    // Log the error for debugging and return a JSON error response
    console.error(
      "Error in /api/admin/tenants/onboarding:",
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
