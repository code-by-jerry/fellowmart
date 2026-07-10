import { NextResponse } from "next/server";
import { deleteCollection } from "@/lib/catalog/collection-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      collection_id?: string;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const collectionId = String(body.collection_id ?? "").trim();

    if (!tenantSlug || !collectionId) {
      return NextResponse.json(
        { error: "Tenant slug and collection id are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    await deleteCollection(session.supabase, session.tenant.id, collectionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
