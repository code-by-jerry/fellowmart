import { NextResponse } from "next/server";
import {
  createHeroBanner,
  type HeroBannerInput,
} from "@/lib/catalog/hero-banner-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      banner?: HeroBannerInput;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const banner = body.banner;

    if (!tenantSlug || !banner?.title?.trim() || !banner?.desktop_image_url?.trim()) {
      return NextResponse.json(
        { error: "Tenant slug, title, and desktop image are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    const bannerId = await createHeroBanner(
      session.supabase,
      session.tenant.id,
      banner,
    );

    return NextResponse.json({ success: true, banner_id: bannerId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
