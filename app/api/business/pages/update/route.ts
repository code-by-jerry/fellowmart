import { NextResponse } from "next/server";
import {
  updateStorePage,
  type StorePageInput,
} from "@/lib/catalog/store-page-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      page_id?: string;
      page?: StorePageInput;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const pageId = String(body.page_id ?? "").trim();
    const page = body.page;

    if (!tenantSlug || !pageId || !page?.title?.trim()) {
      return NextResponse.json(
        { error: "Tenant slug, page id, and title are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    await updateStorePage(session.supabase, session.tenant.id, pageId, page);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
