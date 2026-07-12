import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  canManageTenant,
  getTenantAccess,
} from "@/lib/business/provision-tenant";
import { isStoreCurrency } from "@/lib/currency/currencies";
import { createClient } from "@/utils/supabase/server";

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function cleanHex(value: unknown, fallback = "#0f172a") {
  const text = String(value ?? "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text : fallback;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const tenantSlug = String(body.tenant_slug ?? "").trim();

    if (!tenantSlug) {
      return NextResponse.json({ error: "Tenant slug is required." }, { status: 400 });
    }

    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Store name is required." }, { status: 400 });
    }

    const currencyRaw = String(body.currency ?? "INR").trim().toUpperCase();
    if (!isStoreCurrency(currencyRaw)) {
      return NextResponse.json(
        { error: "Currency must be INR, USD, EUR, or AED." },
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
    if (!access || !canManageTenant(access.role)) {
      return NextResponse.json(
        { error: "Only store owners and admins can update settings." },
        { status: 403 },
      );
    }

    const payload = {
      name,
      business_description: clean(body.business_description),
      contact_email: clean(body.contact_email),
      contact_phone: clean(body.contact_phone),
      currency: currencyRaw,
      logo_url: clean(body.logo_url),
      favicon_url: clean(body.favicon_url),
      primary_color: cleanHex(body.primary_color),
      meta_title: clean(body.meta_title),
      meta_description: clean(body.meta_description),
      meta_keywords: clean(body.meta_keywords),
      announcement_text: clean(body.announcement_text),
      announcement_promo: clean(body.announcement_promo),
      footer_description: clean(body.footer_description),
      home_hero_eyebrow: clean(body.home_hero_eyebrow),
      home_hero_title: clean(body.home_hero_title),
      home_hero_description: clean(body.home_hero_description),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("tenants")
      .update(payload)
      .eq("id", access.tenant.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const heroTitle = clean(body.home_hero_title) ?? `Welcome to ${name}`;
    const heroSubtitle = clean(body.home_hero_description) ?? "";

    const { data: catalog } = await supabase
      .from("tenant_catalog_settings")
      .select("id")
      .eq("tenant_id", access.tenant.id)
      .maybeSingle();

    if (catalog) {
      await supabase
        .from("tenant_catalog_settings")
        .update({
          hero_title: heroTitle,
          hero_subtitle: heroSubtitle,
          updated_at: new Date().toISOString(),
        })
        .eq("id", catalog.id);
    } else {
      await supabase.from("tenant_catalog_settings").insert({
        tenant_id: access.tenant.id,
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
      });
    }

    const { emitEvent } = await import("@/lib/activity/emit");
    await emitEvent({
      type: "settings.updated",
      title: "Store settings updated",
      body: name,
      href: `/business/${tenantSlug}/settings`,
      actorId: user.id,
      actorEmail: user.email,
      tenantId: access.tenant.id,
      notifyTenant: false,
      logTenant: true,
      logPlatform: true,
      action: "settings.updated",
      entityType: "tenant",
      entityId: access.tenant.id,
      summary: `Store settings updated: ${name}`,
      meta: { tenant_slug: tenantSlug, currency: currencyRaw },
    });

    revalidatePath(`/store/${tenantSlug}`, "layout");
    revalidatePath(`/business/${tenantSlug}`, "layout");

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
