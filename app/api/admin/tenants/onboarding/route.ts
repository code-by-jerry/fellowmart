import { NextResponse } from "next/server";
import { requirePlatformAdminTenant } from "@/lib/admin/auth";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const tenantSlug = String(form.get("tenant_slug") ?? "").trim();
    const onboardingStatus = String(form.get("onboarding_status") ?? "").trim();

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

    const { db, tenant } = ctx;

    const tenantUpdatePayload: Record<string, unknown> = {
      onboarding_status: onboardingStatus,
      updated_at: new Date().toISOString(),
    };

    if (onboardingStatus === "active" || onboardingStatus === "completed") {
      tenantUpdatePayload.is_active = true;
    }

    if (onboardingStatus === "pending") {
      tenantUpdatePayload.is_active = false;
    }

    const { error: updateError } = await db
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
      const { data: existingSubscription } = await db
        .from("subscriptions")
        .select("id, status")
        .eq("tenant_id", tenant.id)
        .maybeSingle();

      if (existingSubscription) {
        await db
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
        await db.from("subscriptions").insert({
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
  } catch (err: unknown) {
    console.error(
      "Error in /api/admin/tenants/onboarding:",
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
