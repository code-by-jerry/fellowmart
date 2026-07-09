import { NextResponse } from "next/server";
import { requirePlatformAdminApi } from "@/lib/admin/auth";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const { db } = await requirePlatformAdminApi();
    const form = await request.formData();

    const userId = String(form.get("user_id") ?? "").trim();
    const full_name = String(form.get("full_name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const marketing_opt_in = form.get("marketing_opt_in") === "on";

    if (!userId || !full_name || !phone) {
      return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
    }

    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }

    const { error } = await db
      .from("profiles")
      .update({
        full_name,
        phone: digitsOnly,
        marketing_opt_in,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return redirectTo(request, `/admin/dashboard/customers/${userId}?success=Profile updated`);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return redirectTo(request, "/admin/login");
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return redirectTo(request, "/admin/login?error=Access denied");
    }
    console.error("customers/update:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
