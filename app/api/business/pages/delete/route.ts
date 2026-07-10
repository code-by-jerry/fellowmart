import { NextResponse } from "next/server";
import { deleteStorePage } from "@/lib/catalog/store-page-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      page_id?: string;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const pageId = String(body.page_id ?? "").trim();

    if (!tenantSlug || !pageId) {
      return NextResponse.json(
        { error: "Tenant slug and page id are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    await deleteStorePage(session.supabase, session.tenant.id, pageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
