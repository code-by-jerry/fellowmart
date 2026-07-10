import Link from "next/link";
import { requireTenantManager } from "@/lib/auth/business-access";
import { BlogPostForm } from "@/components/business/BlogPostForm";
import { AdminFormCard } from "@/components/admin/admin-ui";

export default async function NewBlogPostPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { tenant } = await requireTenantManager(tenantSlug);

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
          Create blog post
        </h2>
        <p className="mt-0.5 text-[13px] text-gray-500">
          Write an article for your storefront. Set status to Published when
          ready.
        </p>
      </div>

      <AdminFormCard>
        <BlogPostForm mode="create" tenantSlug={tenant.slug} />
      </AdminFormCard>
    </div>
  );
}
