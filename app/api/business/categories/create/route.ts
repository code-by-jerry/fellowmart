import { NextResponse } from "next/server";
import { createCategory } from "@/lib/catalog/category-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";
import type { CategoryInput } from "@/lib/catalog/category-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      category?: CategoryInput;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const category = body.category;

    if (!tenantSlug || !category?.name?.trim()) {
      return NextResponse.json(
        { error: "Tenant slug and category name are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    const categoryId = await createCategory(
      session.supabase,
      session.tenant.id,
      category,
    );

    return NextResponse.json({ success: true, category_id: categoryId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
