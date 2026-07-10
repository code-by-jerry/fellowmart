import { NextResponse } from "next/server";
import { requirePlatformAdminApi } from "@/lib/admin/auth";
import { toPlanInputFromForm } from "@/lib/subscriptions/plan-utils";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const { db } = await requirePlatformAdminApi();
    const form = await request.formData();
    const planId = String(form.get("plan_id") ?? "").trim();
    const input = toPlanInputFromForm(form);

    if (!planId || !input.name || !input.price_display) {
      return redirectTo(
        request,
        "/admin/dashboard/subscription-plans?error=Invalid plan update request",
      );
    }

    const { error } = await db
      .from("subscription_plans")
      .update({
        name: input.name,
        description: input.description,
        price_amount: input.price_amount,
        price_currency: input.price_currency ?? "INR",
        price_display: input.price_display,
        billing_period: input.billing_period,
        features: input.features,
        is_featured: input.is_featured ?? false,
        is_active: input.is_active ?? true,
        sort_order: Number.isFinite(input.sort_order) ? input.sort_order : 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", planId);

    if (error) {
      return redirectTo(
        request,
        `/admin/dashboard/subscription-plans/${planId}/edit?error=${encodeURIComponent(error.message)}`,
      );
    }

    return redirectTo(
      request,
      `/admin/dashboard/subscription-plans/${planId}/edit?success=Plan updated`,
    );
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return redirectTo(request, "/admin/login");
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return redirectTo(request, "/admin/login?error=Access denied");
    }
    console.error("subscription-plans/update:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
