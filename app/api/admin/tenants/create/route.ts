import { NextResponse } from "next/server";
import { provisionTenant } from "@/lib/business/provision-tenant";
import { BUSINESS_TYPES } from "@/lib/types/business";
import { requirePlatformAdminApi } from "@/lib/admin/auth";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { redirectTo } from "@/lib/route-utils";

const BUSINESS_TYPE_SET = new Set(BUSINESS_TYPES.map((type) => type.value));

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const slug = normalizeTenantSlug(String(form.get("slug") ?? name));
    const businessType = String(form.get("business_type") ?? "general");
    const ownerEmail = String(form.get("owner_email") ?? "").trim().toLowerCase();
    const ownerName = String(form.get("owner_name") ?? "").trim();
    const ownerPhone = String(form.get("owner_phone") ?? "").trim();
    const businessDescription = String(form.get("business_description") ?? "").trim();
    const onboardingStatus = String(form.get("onboarding_status") ?? "active");

    if (!name || !slug || !ownerEmail) {
      return redirectTo(
        request,
        "/admin/dashboard/stores/new?error=Name, slug, and owner email are required",
      );
    }

    if (!BUSINESS_TYPE_SET.has(businessType as (typeof BUSINESS_TYPES)[number]["value"])) {
      return redirectTo(request, "/admin/dashboard/stores/new?error=Invalid business type");
    }

    const { userId, db } = await requirePlatformAdminApi();

    const result = await provisionTenant(db, {
      businessName: name,
      businessSlug: slug,
      businessType: businessType as (typeof BUSINESS_TYPES)[number]["value"],
      ownerEmail,
      ownerName: ownerName || name,
      ownerPhone: ownerPhone || undefined,
      businessDescription: businessDescription || undefined,
      approvedByUserId: userId,
      onboardingStatus:
        onboardingStatus === "pending" ||
        onboardingStatus === "active" ||
        onboardingStatus === "completed"
          ? onboardingStatus
          : "active",
      isActive: onboardingStatus !== "pending",
    });

    return redirectTo(
      request,
      `/admin/dashboard/stores/${result.tenantSlug}/settings?success=Business created successfully`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return redirectTo(
      request,
      `/admin/dashboard/stores/new?error=${encodeURIComponent(message)}`,
    );
  }
}
