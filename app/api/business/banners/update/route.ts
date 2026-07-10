import { NextResponse } from "next/server";
import {
  updateHeroBanner,
  type HeroBannerInput,
} from "@/lib/catalog/hero-banner-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      banner_id?: string;
      banner?: HeroBannerInput;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const bannerId = String(body.banner_id ?? "").trim();
    const banner = body.banner;

    if (
      !tenantSlug ||
      !bannerId ||
      !banner?.title?.trim() ||
      !banner?.desktop_image_url?.trim()
    ) {
      return NextResponse.json(
        { error: "Tenant slug, banner id, title, and desktop image are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    await updateHeroBanner(session.supabase, session.tenant.id, bannerId, banner);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
