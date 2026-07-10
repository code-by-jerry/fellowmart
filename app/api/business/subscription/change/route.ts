import { NextResponse } from "next/server";
import {
  canManageTenant,
  getTenantAccess,
} from "@/lib/business/provision-tenant";
import { createClient } from "@/utils/supabase/server";
import { getSubscriptionPlanBySlug } from "@/lib/subscriptions/plans";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      plan_slug?: string;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const planSlug = String(body.plan_slug ?? "").trim().toLowerCase();

    if (!tenantSlug || !planSlug) {
      return NextResponse.json(
        { error: "Tenant slug and plan are required." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await getTenantAccess(supabase, user.id, tenantSlug);
    if (!access || !canManageTenant(access.role)) {
      return NextResponse.json(
        { error: "Only store owners and admins can change the plan." },
        { status: 403 },
      );
    }

    const plan = await getSubscriptionPlanBySlug(supabase, planSlug);
    if (!plan || !plan.is_active) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    if (plan.billing_period === "custom") {
      return NextResponse.json(
        {
          error:
            "Custom plans require sales assistance. Use Contact sales to continue.",
        },
        { status: 400 },
      );
    }

    const tenantId = access.tenant.id;
    const now = new Date().toISOString();

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id, plan_name")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (existing?.plan_name === plan.slug) {
      return NextResponse.json({
        success: true,
        unchanged: true,
        plan_slug: plan.slug,
      });
    }

    if (existing) {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          plan_name: plan.slug,
          status: "active",
          is_active: true,
          billing_cycle:
            plan.billing_period === "yearly" ? "yearly" : "monthly",
          updated_at: now,
        })
        .eq("tenant_id", tenantId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    } else {
      const { error } = await supabase.from("subscriptions").insert({
        tenant_id: tenantId,
        plan_name: plan.slug,
        status: "active",
        is_active: true,
        billing_cycle: plan.billing_period === "yearly" ? "yearly" : "monthly",
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    const { emitEvent } = await import("@/lib/activity/emit");
    await emitEvent({
      type: "subscription.changed",
      title: "Plan changed",
      body: `${access.tenant.name} → ${plan.name}`,
      href: `/business/${tenantSlug}/subscription`,
      actorId: user.id,
      actorEmail: user.email,
      tenantId: tenantId,
      notifyPlatform: true,
      notifyTenant: true,
      logPlatform: true,
      logTenant: true,
      action: "subscription.changed",
      entityType: "subscription",
      entityId: tenantId,
      summary: `Plan changed to ${plan.name}`,
      meta: { tenant_slug: tenantSlug, plan_slug: plan.slug },
    });

    return NextResponse.json({
      success: true,
      plan_slug: plan.slug,
      plan_name: plan.name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
