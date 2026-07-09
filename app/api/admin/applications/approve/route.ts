import { NextResponse } from "next/server";
import { provisionTenant } from "@/lib/business/provision-tenant";
import { requirePlatformAdminApi } from "@/lib/admin/auth";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const applicationId = String(form.get("application_id") ?? "").trim();
    const reviewNotes = String(form.get("review_notes") ?? "").trim();

    const { userId, db } = await requirePlatformAdminApi();

    const { data: application, error } = await db
      .from("business_applications")
      .select("*")
      .eq("id", applicationId)
      .eq("status", "pending")
      .maybeSingle();

    if (error || !application) {
      return redirectTo(request, "/admin/dashboard/applications?error=Application not found");
    }

    const result = await provisionTenant(db, {
      businessName: application.business_name,
      businessSlug: application.business_slug,
      businessType: application.business_type,
      ownerEmail: application.applicant_email,
      ownerName: application.applicant_name,
      ownerPhone: application.applicant_phone,
      businessDescription: application.business_description ?? undefined,
      addressLine1: application.address_line1 ?? undefined,
      city: application.city ?? undefined,
      state: application.state ?? undefined,
      postalCode: application.postal_code ?? undefined,
      country: application.country ?? "IN",
      approvedByUserId: userId,
      onboardingStatus: "active",
      isActive: true,
    });

    const { error: updateError } = await db
      .from("business_applications")
      .update({
        status: "approved",
        tenant_id: result.tenantId,
        review_notes: reviewNotes || null,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", application.id);

    if (updateError) {
      return redirectTo(
        request,
        "/admin/dashboard/applications?error=Tenant created but application update failed",
      );
    }

    return redirectTo(
      request,
      `/admin/dashboard/stores/${result.tenantSlug}/settings?success=Application approved and business provisioned`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return redirectTo(
      request,
      `/admin/dashboard/applications?error=${encodeURIComponent(message)}`,
    );
  }
}
