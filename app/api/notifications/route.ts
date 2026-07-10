import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isPlatformAdminProfile } from "@/lib/auth/platform-admin";
import {
  canManageTenant,
  getTenantAccess,
} from "@/lib/business/provision-tenant";

async function authorize(
  supabase: Awaited<ReturnType<typeof createClient>>,
  audience: string,
  tenantSlug: string | null,
): Promise<
  | { user: { id: string }; tenantId: string | null }
  | { error: string; status: 400 | 401 | 403 }
> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 };

  if (audience === "platform") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, email")
      .eq("id", user.id)
      .maybeSingle();
    if (!isPlatformAdminProfile(profile)) {
      return { error: "Forbidden", status: 403 };
    }
    return { user, tenantId: null };
  }

  if (!tenantSlug) {
    return { error: "tenant_slug required", status: 400 };
  }

  const access = await getTenantAccess(supabase, user.id, tenantSlug);
  if (!access || !canManageTenant(access.role)) {
    return { error: "Forbidden", status: 403 };
  }
  return { user, tenantId: access.tenant.id };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const audience = url.searchParams.get("audience") ?? "platform";
  const tenantSlug = url.searchParams.get("tenant_slug");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);

  const supabase = await createClient();
  const auth = await authorize(supabase, audience, tenantSlug);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let query = supabase
    .from("notifications")
    .select("id, audience, tenant_id, type, title, body, href, read_at, created_at")
    .eq("audience", audience)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (audience === "tenant" && auth.tenantId) {
    query = query.eq("tenant_id", auth.tenantId);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const unread = (data ?? []).filter((n) => !n.read_at).length;
  return NextResponse.json({ notifications: data ?? [], unread });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    audience?: string;
    tenant_slug?: string;
    ids?: string[];
    mark_all?: boolean;
  };

  const audience = body.audience ?? "platform";
  const supabase = await createClient();
  const auth = await authorize(supabase, audience, body.tenant_slug ?? null);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const now = new Date().toISOString();
  let query = supabase
    .from("notifications")
    .update({ read_at: now })
    .eq("audience", audience)
    .is("read_at", null);

  if (audience === "tenant" && auth.tenantId) {
    query = query.eq("tenant_id", auth.tenantId);
  }

  if (!body.mark_all) {
    const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: "ids required" }, { status: 400 });
    }
    query = query.in("id", ids);
  }

  const { error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
