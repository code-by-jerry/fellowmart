import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenantManager } from "@/lib/auth/business-access";
import { BlogPostForm } from "@/components/business/BlogPostForm";
import { AdminFormCard } from "@/components/admin/admin-ui";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>;
}) {
  const { tenantSlug, id } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (error || !post) notFound();

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/business/${tenant.slug}/blog`}
          className="text-sm text-gray-500 hover:text-primary"
        >
          ← Back to blog
        </Link>
        <h2 className="mt-1.5 text-lg font-semibold text-gray-900">
          Edit blog post
        </h2>
        <p className="mt-0.5 text-[13px] text-gray-500">{post.title}</p>
      </div>

      <AdminFormCard>
        <BlogPostForm mode="edit" tenantSlug={tenant.slug} initial={post} />
      </AdminFormCard>
    </div>
  );
}
