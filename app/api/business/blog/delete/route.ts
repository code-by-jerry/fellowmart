import { NextResponse } from "next/server";
import { deleteBlogPost } from "@/lib/catalog/blog-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      post_id?: string;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const postId = String(body.post_id ?? "").trim();

    if (!tenantSlug || !postId) {
      return NextResponse.json(
        { error: "Tenant slug and post id are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    await deleteBlogPost(session.supabase, session.tenant.id, postId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
