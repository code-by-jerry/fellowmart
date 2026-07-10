import { NextResponse } from "next/server";
import { validateTenantSlug } from "@/lib/routes/store-routes";
import { BUSINESS_TYPES } from "@/lib/types/business";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { createClient } from "@/utils/supabase/server";

const BUSINESS_TYPE_SET = new Set(BUSINESS_TYPES.map((type) => type.value));

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const form = await request.formData();
    const applicant_name = String(form.get("applicant_name") ?? "").trim();
    const applicant_email = String(form.get("applicant_email") ?? "").trim().toLowerCase();
    const applicant_phone = String(form.get("applicant_phone") ?? "").trim();
    const business_name = String(form.get("business_name") ?? "").trim();
    const business_slug = normalizeTenantSlug(
      String(form.get("business_slug") ?? business_name),
    );
    const business_type = String(form.get("business_type") ?? "general");
    const business_description = String(form.get("business_description") ?? "").trim();
    const address_line1 = String(form.get("address_line1") ?? "").trim();
    const city = String(form.get("city") ?? "").trim();
    const state = String(form.get("state") ?? "").trim();
    const postal_code = String(form.get("postal_code") ?? "").trim();

    if (!applicant_name || !applicant_email || !applicant_phone || !business_name || !business_slug) {
      return NextResponse.json({ error: "Please fill all required fields." }, { status: 400 });
    }

    const slugError = validateTenantSlug(business_slug);
    if (slugError) {
      return NextResponse.json({ error: slugError }, { status: 400 });
    }

    if (!BUSINESS_TYPE_SET.has(business_type as (typeof BUSINESS_TYPES)[number]["value"])) {
      return NextResponse.json({ error: "Invalid business type." }, { status: 400 });
    }

    const { data: existingTenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", business_slug)
      .maybeSingle();

    if (existingTenant) {
      return NextResponse.json(
        { error: "This store URL is already taken. Choose another slug." },
        { status: 409 },
      );
    }

    const { data: pendingApplication } = await supabase
      .from("business_applications")
      .select("id")
      .eq("business_slug", business_slug)
      .eq("status", "pending")
      .maybeSingle();

    if (pendingApplication) {
      return NextResponse.json(
        { error: "An application for this store URL is already pending review." },
        { status: 409 },
      );
    }

    const { data: created, error } = await supabase
      .from("business_applications")
      .insert({
        user_id: user.id,
        applicant_name,
        applicant_email,
        applicant_phone,
        business_name,
        business_slug,
        business_type,
        business_description: business_description || null,
        address_line1: address_line1 || null,
        city: city || null,
        state: state || null,
        postal_code: postal_code || null,
        country: "IN",
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { emitEvent } = await import("@/lib/activity/emit");
    await emitEvent({
      type: "application.submitted",
      title: "New business application",
      body: `${business_name} (${business_slug}) from ${applicant_name}`,
      href: `/admin/dashboard/applications/${created.id}`,
      actorId: user.id,
      actorEmail: applicant_email,
      notifyPlatform: true,
      logPlatform: true,
      action: "application.submitted",
      entityType: "business_application",
      entityId: created.id,
      summary: `Application submitted: ${business_name}`,
      meta: { business_slug, business_type },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
