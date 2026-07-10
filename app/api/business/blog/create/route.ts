import { NextResponse } from "next/server";
import {
  createBlogPost,
  type BlogPostInput,
} from "@/lib/catalog/blog-service";
import { requireBusinessApiTenant } from "@/lib/auth/business-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      tenant_slug?: string;
      post?: BlogPostInput;
    };

    const tenantSlug = String(body.tenant_slug ?? "").trim();
    const post = body.post;

    if (!tenantSlug || !post?.title?.trim()) {
      return NextResponse.json(
        { error: "Tenant slug and post title are required." },
        { status: 400 },
      );
    }

    const session = await requireBusinessApiTenant(tenantSlug);
    if ("error" in session) return session.error;

    const postId = await createBlogPost(
      session.supabase,
      session.tenant.id,
      post,
    );

    return NextResponse.json({ success: true, post_id: postId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
