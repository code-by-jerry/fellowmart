import { NextResponse } from "next/server";
import { requirePlatformAdminApi } from "@/lib/admin/auth";
import { slugify } from "@/lib/admin/slugify";
import { toPlanInputFromForm } from "@/lib/subscriptions/plan-utils";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const { db } = await requirePlatformAdminApi();
    const form = await request.formData();
    const input = toPlanInputFromForm(form);

    if (!input.name || !input.slug || !input.price_display) {
      return redirectTo(
        request,
        "/admin/dashboard/subscription-plans/new?error=Name, slug, and price display are required",
      );
    }

    const slug = slugify(input.slug);
    if (!slug) {
      return redirectTo(
        request,
        "/admin/dashboard/subscription-plans/new?error=A valid slug is required",
      );
    }

    const { error } = await db.from("subscription_plans").insert({
      slug,
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
    });

    if (error) {
      const message =
        error.code === "23505"
          ? "A plan with this slug already exists"
          : error.message;
      return redirectTo(
        request,
        `/admin/dashboard/subscription-plans/new?error=${encodeURIComponent(message)}`,
      );
    }

    return redirectTo(
      request,
      "/admin/dashboard/subscription-plans?success=Subscription plan created",
    );
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return redirectTo(request, "/admin/login");
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return redirectTo(request, "/admin/login?error=Access denied");
    }
    console.error("subscription-plans/create:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
