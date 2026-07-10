import { NextResponse } from "next/server";
import { deleteHeroBanner } from "@/lib/catalog/hero-banner-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      banner_id?: string;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const bannerId = String(body.banner_id ?? "").trim();

    if (!tenantSlug || !bannerId) {
      return NextResponse.json(
        { error: "Tenant slug and banner id are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    await deleteHeroBanner(session.supabase, session.tenant.id, bannerId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
