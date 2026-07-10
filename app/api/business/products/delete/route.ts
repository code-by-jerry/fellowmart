import { NextResponse } from "next/server";
import { deleteProduct } from "@/lib/catalog/product-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      product_id?: string;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const productId = String(body.product_id ?? "").trim();

    if (!tenantSlug || !productId) {
      return NextResponse.json(
        { error: "Tenant slug and product id are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    await deleteProduct(session.supabase, session.tenant.id, productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
