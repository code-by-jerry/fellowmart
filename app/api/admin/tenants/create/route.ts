import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-server";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const slug = normalizeTenantSlug(String(form.get("slug") ?? name));

    const supabase = await createAdminClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return redirectTo(request, "/admin/login");

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        name,
        slug,
        owner_id: user.id,
        onboarding_status: "pending",
        is_active: false,
      })
      .select("id")
      .single();

    if (tenantError || !tenant)
      return redirectTo(
        request,
        "/admin/dashboard/stores?error=Could not create store",
      );
    await supabase
      .from("tenant_memberships")
      .insert({ tenant_id: tenant.id, user_id: user.id, role: "owner" });
    await supabase.from("subscriptions").insert({
      tenant_id: tenant.id,
      plan_name: "starter",
      status: "trial",
      is_active: false,
    });

    return redirectTo(request, "/admin/dashboard/stores");
  } catch (err: any) {
    console.error("Error in /api/admin/tenants/create:", err?.message ?? err);
    return new NextResponse(
      JSON.stringify({ error: err?.message ?? "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
