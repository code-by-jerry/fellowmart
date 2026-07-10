import { NextResponse } from "next/server";
import { requirePlatformAdminApi } from "@/lib/admin/auth";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const { db } = await requirePlatformAdminApi();
    const form = await request.formData();
    const planId = String(form.get("plan_id") ?? "").trim();

    if (!planId) {
      return redirectTo(
        request,
        "/admin/dashboard/subscription-plans?error=Plan not found",
      );
    }

    const { data: plan, error: planError } = await db
      .from("subscription_plans")
      .select("slug")
      .eq("id", planId)
      .maybeSingle();

    if (planError || !plan) {
      return redirectTo(
        request,
        "/admin/dashboard/subscription-plans?error=Plan not found",
      );
    }

    const { count, error: countError } = await db
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("plan_name", plan.slug);

    if (countError) {
      return redirectTo(
        request,
        "/admin/dashboard/subscription-plans?error=Could not verify plan usage",
      );
    }

    if ((count ?? 0) > 0) {
      return redirectTo(
        request,
        "/admin/dashboard/subscription-plans?error=Cannot delete a plan assigned to active stores",
      );
    }

    const { error: deleteError } = await db
      .from("subscription_plans")
      .delete()
      .eq("id", planId);

    if (deleteError) {
      return redirectTo(
        request,
        `/admin/dashboard/subscription-plans?error=${encodeURIComponent(deleteError.message)}`,
      );
    }

    return redirectTo(
      request,
      "/admin/dashboard/subscription-plans?success=Subscription plan deleted",
    );
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return redirectTo(request, "/admin/login");
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return redirectTo(request, "/admin/login?error=Access denied");
    }
    console.error("subscription-plans/delete:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
