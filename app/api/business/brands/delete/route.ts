import { NextResponse } from "next/server";
import { deleteBrand } from "@/lib/catalog/brand-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      brand_id?: string;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const brandId = String(body.brand_id ?? "").trim();

    if (!tenantSlug || !brandId) {
      return NextResponse.json(
        { error: "Tenant slug and brand id are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    await deleteBrand(session.supabase, session.tenant.id, brandId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
