import { NextResponse } from "next/server";
import { createBrand, type BrandInput } from "@/lib/catalog/brand-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      brand?: BrandInput;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const brand = body.brand;

    if (!tenantSlug || !brand?.name?.trim()) {
      return NextResponse.json(
        { error: "Tenant slug and brand name are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    const brandId = await createBrand(session.supabase, session.tenant.id, brand);

    return NextResponse.json({ success: true, brand_id: brandId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
