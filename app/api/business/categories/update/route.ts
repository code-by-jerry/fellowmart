import { NextResponse } from "next/server";
import { updateCategory } from "@/lib/catalog/category-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";
import type { CategoryInput } from "@/lib/catalog/category-service";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      category_id?: string;
      category?: CategoryInput;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const categoryId = String(body.category_id ?? "").trim();
    const category = body.category;

    if (!tenantSlug || !categoryId || !category?.name?.trim()) {
      return NextResponse.json(
        { error: "Tenant slug, category id, and name are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    await updateCategory(session.supabase, session.tenant.id, categoryId, category);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
