import { NextResponse } from "next/server";
import { requirePlatformAdminApi } from "@/lib/admin/auth";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const { db } = await requirePlatformAdminApi();
    const form = await request.formData();

    const userId = String(form.get("user_id") ?? "").trim();
    const addressId = String(form.get("address_id") ?? "").trim();

    if (!userId || !addressId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const { error } = await db
      .from("customer_addresses")
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq("id", addressId)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return redirectTo(request, `/admin/dashboard/customers/${userId}?success=Default address updated`);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return redirectTo(request, "/admin/login");
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return redirectTo(request, "/admin/login?error=Access denied");
    }
    console.error("customers/addresses/set-default:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
