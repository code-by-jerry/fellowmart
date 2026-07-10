import { NextResponse } from "next/server";
import { createTag, listTags } from "@/lib/catalog/tag-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantSlug = String(searchParams.get("tenant_slug") ?? "").trim();
    const query = String(searchParams.get("q") ?? "").trim();

    if (!tenantSlug) {
      return NextResponse.json({ error: "Tenant slug is required." }, { status: 400 });
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    const tags = await listTags(session.supabase, session.tenant.id, {
      activeOnly: true,
      query: query || undefined,
      limit: 40,
    });

    return NextResponse.json({ tags });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      name?: string;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const name = String(body.name ?? "").trim();

    if (!tenantSlug || !name) {
      return NextResponse.json(
        { error: "Tenant slug and tag name are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    const tag = await createTag(session.supabase, session.tenant.id, name);

    return NextResponse.json({ success: true, tag });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
