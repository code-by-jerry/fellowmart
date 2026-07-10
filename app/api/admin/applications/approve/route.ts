import { provisionTenant } from "@/lib/business/provision-tenant";
import { requirePlatformAdminApi } from "@/lib/admin/auth";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  const form = await request.formData();
  const applicationId = String(form.get("application_id") ?? "").trim();
  const reviewNotes = String(form.get("review_notes") ?? "").trim();

  try {
    const { userId, db } = await requirePlatformAdminApi();

    const { data: application, error } = await db
      .from("business_applications")
      .select("*")
      .eq("id", applicationId)
      .eq("status", "pending")
      .maybeSingle();

    if (error || !application) {
      return redirectTo(
        request,
        `/admin/dashboard/applications/${applicationId}?error=Application not found or already reviewed`,
      );
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
        `/admin/dashboard/applications/${application.id}?error=Tenant created but application update failed`,
      );
    }

    const { emitEvent } = await import("@/lib/activity/emit");
    await emitEvent({
      type: "application.approved",
      title: "Application approved",
      body: `${application.business_name} is now live as ${result.tenantSlug}`,
      href: `/admin/dashboard/stores/${result.tenantSlug}/settings`,
      actorId: userId,
      notifyPlatform: true,
      logPlatform: true,
      tenantId: result.tenantId,
      notifyTenant: true,
      logTenant: true,
      action: "application.approved",
      entityType: "business_application",
      entityId: application.id,
      summary: `Approved application: ${application.business_name}`,
      meta: { tenant_slug: result.tenantSlug },
    });

    return redirectTo(
      request,
      `/admin/dashboard/stores/${result.tenantSlug}/settings?success=Application approved and business provisioned`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    const fallback = applicationId
      ? `/admin/dashboard/applications/${applicationId}?error=${encodeURIComponent(message)}`
      : `/admin/dashboard/applications?error=${encodeURIComponent(message)}`;

    return redirectTo(request, fallback);
  }
}
