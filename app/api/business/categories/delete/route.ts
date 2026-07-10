import { NextResponse } from "next/server";
import { deleteCategory } from "@/lib/catalog/category-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      category_id?: string;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const categoryId = String(body.category_id ?? "").trim();

    if (!tenantSlug || !categoryId) {
      return NextResponse.json(
        { error: "Tenant slug and category id are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    await deleteCategory(session.supabase, session.tenant.id, categoryId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
