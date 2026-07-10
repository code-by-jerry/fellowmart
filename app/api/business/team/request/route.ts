import { NextResponse } from "next/server";
import {
  canManageTeam,
  getTenantAccess,
} from "@/lib/business/provision-tenant";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      member_email?: string;
      requested_role?: string;
      notes?: string;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const memberEmail = String(body.member_email ?? "").trim().toLowerCase();
    const requestedRole = String(body.requested_role ?? "staff").trim();
    const notes = String(body.notes ?? "").trim() || null;

    if (!tenantSlug || !memberEmail) {
      return NextResponse.json(
        { error: "Tenant and member email are required." },
        { status: 400 },
      );
    }

    if (!["admin", "staff"].includes(requestedRole)) {
      return NextResponse.json(
        { error: "Role must be admin or staff." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await getTenantAccess(supabase, user.id, tenantSlug);
    if (!access || !canManageTeam(access.role)) {
      return NextResponse.json(
        { error: "Only store owners and admins can request team access." },
        { status: 403 },
      );
    }

    const { data: existingPending } = await supabase
      .from("team_access_requests")
      .select("id")
      .eq("tenant_id", access.tenant.id)
      .eq("member_email", memberEmail)
      .eq("status", "pending")
      .maybeSingle();

    if (existingPending) {
      return NextResponse.json(
        { error: "A pending request already exists for this email." },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("team_access_requests").insert({
      tenant_id: access.tenant.id,
      requested_by: user.id,
      member_email: memberEmail,
      requested_role: requestedRole,
      notes,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { emitEvent } = await import("@/lib/activity/emit");
    await emitEvent({
      type: "team.request",
      title: "Team access requested",
      body: `${memberEmail} as ${requestedRole} for ${access.tenant.name}`,
      href: `/admin/dashboard/stores/${tenantSlug}/settings`,
      actorId: user.id,
      actorEmail: user.email,
      tenantId: access.tenant.id,
      notifyPlatform: true,
      notifyTenant: true,
      logPlatform: true,
      logTenant: true,
      action: "team.request",
      entityType: "team_access_request",
      summary: `Team access requested: ${memberEmail}`,
      meta: { tenant_slug: tenantSlug, requested_role: requestedRole },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
