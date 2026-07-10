import { NextResponse } from "next/server";
import { updateCollection } from "@/lib/catalog/collection-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";
import type { CollectionInput } from "@/lib/catalog/collection-service";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      collection_id?: string;
      collection?: CollectionInput;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const collectionId = String(body.collection_id ?? "").trim();
    const collection = body.collection;

    if (!tenantSlug || !collectionId || !collection?.name?.trim()) {
      return NextResponse.json(
        { error: "Tenant slug, collection id, and name are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    await updateCollection(
      session.supabase,
      session.tenant.id,
      collectionId,
      collection,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
