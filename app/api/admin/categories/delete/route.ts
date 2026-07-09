import { NextResponse } from "next/server";
import { requirePlatformAdminApi } from "@/lib/admin/auth";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const { db } = await requirePlatformAdminApi();
    const form = await request.formData();

    const categoryId = String(form.get("category_id") ?? "").trim();
    const tenantId = String(form.get("tenant_id") ?? "").trim();

    if (!categoryId || !tenantId) {
      return NextResponse.json({ error: "Missing category id." }, { status: 400 });
    }

    const { error } = await db
      .from("categories")
      .delete()
      .eq("id", categoryId)
      .eq("tenant_id", tenantId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const tenantSlug = String(form.get("tenant_slug") ?? "").trim();
    const redirectPath = tenantSlug
      ? `/admin/dashboard/categories?tenant=${tenantSlug}`
      : "/admin/dashboard/categories";

    return redirectTo(request, redirectPath);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return redirectTo(request, "/admin/login");
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return redirectTo(request, "/admin/login?error=Access denied");
    }
    console.error("categories/delete:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
