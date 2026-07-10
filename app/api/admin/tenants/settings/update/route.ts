import { NextResponse } from "next/server";
import { requirePlatformAdminTenant } from "@/lib/admin/auth";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const tenantSlug = String(form.get("tenant_slug") ?? "").trim();
    const onboarding_status = String(
      form.get("onboarding_status") ?? "pending",
    );
    const plan_name = String(form.get("plan_name") ?? "starter");
    const subscription_status = String(
      form.get("subscription_status") ?? "trial",
    );
    const is_active = form.get("is_active") === "on";

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

    const { error: tenantUpdateError } = await db
      .from("tenants")
      .update({
        onboarding_status,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tenant.id);

    if (tenantUpdateError) {
      return redirectTo(
        request,
        `/admin/dashboard/stores/${normalizedSlug}/settings?error=Could not update tenant`,
      );
    }

    const { data: existingSubscription } = await db
      .from("subscriptions")
      .select("id")
      .eq("tenant_id", tenant.id)
      .maybeSingle();

    if (existingSubscription) {
      await db
        .from("subscriptions")
        .update({
          plan_name,
          status: subscription_status,
          updated_at: new Date().toISOString(),
        })
        .eq("tenant_id", tenant.id);
    } else {
      await db.from("subscriptions").insert({
        tenant_id: tenant.id,
        plan_name,
        status: subscription_status,
        is_active: true,
      });
    }

    return redirectTo(
      request,
      `/admin/dashboard/stores/${normalizedSlug}/settings?success=Tenant updated`,
    );
  } catch (err: unknown) {
    console.error(
      "Error in /api/admin/tenants/settings/update:",
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
