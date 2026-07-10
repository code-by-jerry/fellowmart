import { NextResponse } from "next/server";
import {
  createStorePage,
  type StorePageInput,
} from "@/lib/catalog/store-page-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      page?: StorePageInput;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const page = body.page;

    if (!tenantSlug || !page?.title?.trim()) {
      return NextResponse.json(
        { error: "Tenant slug and page title are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    const pageId = await createStorePage(
      session.supabase,
      session.tenant.id,
      page,
    );

    return NextResponse.json({ success: true, page_id: pageId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
