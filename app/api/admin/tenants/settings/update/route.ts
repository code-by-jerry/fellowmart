import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-server";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const tenantSlug = String(form.get("tenant_slug") ?? "").trim();
    const logo_url = String(form.get("logo_url") ?? "").trim();
    const primary_color = String(form.get("primary_color") ?? "#000000").trim();
    const hero_title = String(form.get("hero_title") ?? "").trim();
    const hero_subtitle = String(form.get("hero_subtitle") ?? "").trim();
    const onboarding_status = String(
      form.get("onboarding_status") ?? "pending",
    );
    const plan_name = String(form.get("plan_name") ?? "starter");
    const subscription_status = String(
      form.get("subscription_status") ?? "trial",
    );
    const is_active = form.get("is_active") === "on";

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

    const { error: tenantUpdateError } = await supabase
      .from("tenants")
      .update({
        logo_url: logo_url || null,
        primary_color: primary_color || "#000000",
        onboarding_status,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tenant.id);

    if (tenantUpdateError) {
      return redirectTo(
        request,
        "/admin/dashboard/stores?error=Could not update tenant settings",
      );
    }

    const { data: catalogSettings } = await supabase
      .from("tenant_catalog_settings")
      .select("id")
      .eq("tenant_id", tenant.id)
      .maybeSingle();

    if (catalogSettings) {
      await supabase
        .from("tenant_catalog_settings")
        .update({
          hero_title,
          hero_subtitle,
          updated_at: new Date().toISOString(),
        })
        .eq("id", catalogSettings.id);
    } else {
      await supabase
        .from("tenant_catalog_settings")
        .insert({ tenant_id: tenant.id, hero_title, hero_subtitle });
    }

    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("tenant_id", tenant.id)
      .maybeSingle();

    if (existingSubscription) {
      await supabase
        .from("subscriptions")
        .update({
          plan_name,
          status: subscription_status,
          updated_at: new Date().toISOString(),
        })
        .eq("tenant_id", tenant.id);
    } else {
      await supabase.from("subscriptions").insert({
        tenant_id: tenant.id,
        plan_name,
        status: subscription_status,
        is_active: true,
      });
    }

    return redirectTo(
      request,
      `/admin/dashboard/stores/${tenantSlug}/settings?success=Settings updated`,
    );
  } catch (err: any) {
    console.error(
      "Error in /api/admin/tenants/settings/update:",
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
