import { NextResponse } from "next/server";
import { requirePlatformAdminApi } from "@/lib/admin/auth";
import { parseAddressInput } from "@/lib/validation/address";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const { db } = await requirePlatformAdminApi();
    const form = await request.formData();
    const userId = String(form.get("user_id") ?? "").trim();

    if (!userId) {
      return NextResponse.json({ error: "Missing user id." }, { status: 400 });
    }

    const parsed = parseAddressInput(form);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { error } = await db.from("customer_addresses").insert({
      user_id: userId,
      ...parsed,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return redirectTo(request, `/admin/dashboard/customers/${userId}?success=Address added`);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return redirectTo(request, "/admin/login");
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return redirectTo(request, "/admin/login?error=Access denied");
    }
    console.error("customers/addresses/create:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
