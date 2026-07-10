import { NextResponse } from "next/server";
import { saveProduct } from "@/lib/catalog/product-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";
import type { ProductFormInput } from "@/lib/types/product";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      product_id?: string;
      product?: ProductFormInput;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const productId = String(body.product_id ?? "").trim();
    const product = body.product;

    if (!tenantSlug || !productId || !product?.name?.trim() || !product.slug?.trim() || !product.sku?.trim()) {
      return NextResponse.json(
        { error: "Tenant slug, product ID, name, slug, and base SKU are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    const { data: existing } = await session.supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("tenant_id", session.tenant.id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const result = await saveProduct(
      session.supabase,
      session.tenant.id,
      product,
      productId,
    );

    return NextResponse.json({ success: true, product_id: result.productId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
