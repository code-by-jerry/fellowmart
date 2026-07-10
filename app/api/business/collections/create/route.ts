import { NextResponse } from "next/server";
import { createCollection } from "@/lib/catalog/collection-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";
import type { CollectionInput } from "@/lib/catalog/collection-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      collection?: CollectionInput;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const collection = body.collection;

    if (!tenantSlug || !collection?.name?.trim()) {
      return NextResponse.json(
        { error: "Tenant slug and collection name are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    const collectionId = await createCollection(
      session.supabase,
      session.tenant.id,
      collection,
    );

    return NextResponse.json({ success: true, collection_id: collectionId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
