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
      .update({
        status: "rejected",
        review_notes: reviewNotes || "Application rejected.",
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .eq("status", "pending")
      .select("id, business_name, business_slug")
      .maybeSingle();

    if (error || !application) {
      return redirectTo(
        request,
        `/admin/dashboard/applications/${applicationId}?error=Could not reject application`,
      );
    }

    const { emitEvent } = await import("@/lib/activity/emit");
    await emitEvent({
      type: "application.rejected",
      title: "Application rejected",
      body: application.business_name,
      href: `/admin/dashboard/applications/${application.id}`,
      actorId: userId,
      notifyPlatform: true,
      logPlatform: true,
      action: "application.rejected",
      entityType: "business_application",
      entityId: application.id,
      summary: `Rejected application: ${application.business_name}`,
      meta: { business_slug: application.business_slug },
    });

    return redirectTo(
      request,
      `/admin/dashboard/applications/${applicationId}?success=Application rejected`,
    );
  } catch {
    const fallback = applicationId
      ? `/admin/dashboard/applications/${applicationId}?error=Unauthorized`
      : "/admin/dashboard/applications?error=Unauthorized";

    return redirectTo(request, fallback);
  }
}
