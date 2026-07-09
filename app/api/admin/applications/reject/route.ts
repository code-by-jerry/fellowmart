import { requirePlatformAdminApi } from "@/lib/admin/auth";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const applicationId = String(form.get("application_id") ?? "").trim();
    const reviewNotes = String(form.get("review_notes") ?? "").trim();

    const { userId, db } = await requirePlatformAdminApi();

    const { error } = await db
      .from("business_applications")
      .update({
        status: "rejected",
        review_notes: reviewNotes || "Application rejected.",
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .eq("status", "pending");

    if (error) {
      return redirectTo(
        request,
        "/admin/dashboard/applications?error=Could not reject application",
      );
    }

    return redirectTo(request, "/admin/dashboard/applications?success=Application rejected");
  } catch {
    return redirectTo(request, "/admin/dashboard/applications?error=Unauthorized");
  }
}
