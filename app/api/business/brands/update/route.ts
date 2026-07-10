import { NextResponse } from "next/server";
import { updateBrand, type BrandInput } from "@/lib/catalog/brand-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      brand_id?: string;
      brand?: BrandInput;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const brandId = String(body.brand_id ?? "").trim();
    const brand = body.brand;

    if (!tenantSlug || !brandId || !brand?.name?.trim()) {
      return NextResponse.json(
        { error: "Tenant slug, brand id, and brand name are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    await updateBrand(session.supabase, session.tenant.id, brandId, brand);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
