import { NextResponse } from "next/server";
import { requirePlatformAdminApi } from "@/lib/admin/auth";
import { slugify } from "@/lib/admin/slugify";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const { db } = await requirePlatformAdminApi();
    const form = await request.formData();

    const categoryId = String(form.get("category_id") ?? "").trim();
    const tenantId = String(form.get("tenant_id") ?? "").trim();
    const name = String(form.get("name") ?? "").trim();
    const slugInput = String(form.get("slug") ?? "").trim();
    const description = String(form.get("description") ?? "").trim() || null;
    const imageUrl = String(form.get("image_url") ?? "").trim() || null;
    const parentCategoryId = String(form.get("parent_category_id") ?? "").trim() || null;
    const sortOrder = Number(form.get("sort_order") ?? 0);
    const iconName = String(form.get("icon_name") ?? "").trim() || null;
    const productCountText = String(form.get("product_count_text") ?? "").trim() || null;
    const isActive = form.get("is_active") !== "off";

    if (!categoryId || !tenantId || !name) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const slug = slugInput ? slugify(slugInput) : slugify(name);
    if (!slug) {
      return NextResponse.json({ error: "A valid slug is required." }, { status: 400 });
    }

    const { error } = await db
      .from("categories")
      .update({
        name,
        slug,
        description,
        image_url: imageUrl,
      parent_category_id: parentCategoryId,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      icon_name: iconName,
      product_count_text: productCountText,
      is_active: isActive,
      updated_at: new Date().toISOString(),
      })
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
    console.error("categories/update:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
