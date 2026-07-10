import { NextResponse } from "next/server";
import { saveProduct } from "@/lib/catalog/product-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";
import type { ProductFormInput } from "@/lib/types/product";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      product?: ProductFormInput;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const product = body.product;

    if (!tenantSlug || !product?.name?.trim() || !product.slug?.trim() || !product.sku?.trim()) {
      return NextResponse.json(
        { error: "Tenant slug, product name, slug, and base SKU are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    const { productId } = await saveProduct(session.supabase, session.tenant.id, product);

    return NextResponse.json({ success: true, product_id: productId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
