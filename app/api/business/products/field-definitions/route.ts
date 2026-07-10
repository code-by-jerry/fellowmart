import { NextResponse } from "next/server";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";
import type { ProductFieldDefinition } from "@/lib/types/product";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantSlug = String(searchParams.get("tenant_slug") ?? "").trim();

  if (!tenantSlug) {
    return NextResponse.json({ error: "tenant_slug is required." }, { status: 400 });
  }

  const session = await requireBusinessApiTenant(tenantSlug);
  if ("error" in session) return session.error;

  const { data } = await session.supabase
    .from("product_field_definitions")
    .select("*")
    .eq("tenant_id", session.tenant.id)
    .eq("is_active", true)
    .order("sort_order");

  return NextResponse.json({ definitions: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      definition?: ProductFieldDefinition;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const definition = body.definition;

    if (!tenantSlug || !definition?.field_key?.trim() || !definition.label?.trim()) {
      return NextResponse.json(
        { error: "Tenant slug, field key, and label are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    const { data, error } = await session.supabase
      .from("product_field_definitions")
      .upsert(
        {
          tenant_id: session.tenant.id,
          field_key: definition.field_key.trim(),
          label: definition.label.trim(),
          field_type: definition.field_type ?? "text",
          field_group: definition.field_group ?? "Custom",
          description: definition.description ?? null,
          options: definition.options ?? [],
          is_required: definition.is_required ?? false,
          applies_to: definition.applies_to ?? "product",
          sort_order: definition.sort_order ?? 0,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tenant_id,field_key" },
      )
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ definition: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
