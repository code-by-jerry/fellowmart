import { NextResponse } from "next/server";
import {
  updateBlogPost,
  type BlogPostInput,
} from "@/lib/catalog/blog-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      post_id?: string;
      post?: BlogPostInput;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const postId = String(body.post_id ?? "").trim();
    const post = body.post;

    if (!tenantSlug || !postId || !post?.title?.trim()) {
      return NextResponse.json(
        { error: "Tenant slug, post id, and title are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    await updateBlogPost(session.supabase, session.tenant.id, postId, post);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
