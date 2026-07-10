import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { requireTenantManager } from "@/lib/auth/business-access";
import { CatalogDeleteButton } from "@/components/business/CatalogDeleteButton";
import {
  adminBtnPrimaryClass,
  adminBtnSecondaryClass,
  AdminEmptyState,
  AdminPanel,
} from "@/components/admin/admin-ui";
import { formatBlogDate } from "@/lib/catalog/blog-service";
import { storePath } from "@/lib/routes/store-routes";

type BusinessBlogPageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function BusinessBlogPage({
  params,
  searchParams,
}: BusinessBlogPageProps) {
  const { tenantSlug } = await params;
  const { success, error } = await searchParams;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data: posts } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, status, is_active, published_at, cover_image_url, author_name, sort_order",
    )
    .eq("tenant_id", tenant.id)
    .order("sort_order")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-3">
      {success ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] text-gray-500">
          Publish SEO-friendly articles for your store. Live at{" "}
          <Link
            href={storePath(tenant.slug, "blog")}
            className="underline hover:text-gray-800"
            target="_blank"
          >
            /store/{tenant.slug}/blog
          </Link>
        </p>
        <Link
          href={`/business/${tenant.slug}/blog/new`}
          className={adminBtnPrimaryClass}
        >
          <Plus size={14} />
          New post
        </Link>
      </div>

      <AdminPanel>
        {(posts ?? []).length === 0 ? (
          <AdminEmptyState message="No blog posts yet. Create your first article to improve store SEO." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-200 bg-[#f7f7f7]">
                  <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                    Post
                  </th>
                  <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                    Published
                  </th>
                  <th className="px-3 py-2 text-right text-[12px] font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {(posts ?? []).map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        {post.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.cover_image_url}
                            alt=""
                            className="h-10 w-14 rounded border border-gray-200 bg-white object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-14 items-center justify-center rounded bg-gray-100 text-[11px] text-gray-400">
                            —
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-900">
                            {post.title}
                          </span>
                          <p className="text-[11px] text-gray-500">
                            /{post.slug}
                            {post.author_name ? ` · ${post.author_name}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium ${
                          post.status === "published" && post.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {post.status === "published" && post.is_active
                          ? "published"
                          : post.status === "published"
                            ? "hidden"
                            : "draft"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">
                      {formatBlogDate(post.published_at) ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {post.status === "published" && post.is_active ? (
                          <Link
                            href={storePath(tenant.slug, `blog/${post.slug}`)}
                            className={adminBtnSecondaryClass}
                            target="_blank"
                          >
                            View
                          </Link>
                        ) : null}
                        <Link
                          href={`/business/${tenant.slug}/blog/${post.id}/edit`}
                          className={adminBtnSecondaryClass}
                        >
                          <Pencil size={13} />
                          Edit
                        </Link>
                        <CatalogDeleteButton
                          tenantSlug={tenant.slug}
                          itemId={post.id}
                          itemLabel={post.title}
                          endpoint="/api/business/blog/delete"
                          bodyKey="post_id"
                          redirectPath={`/business/${tenant.slug}/blog?success=Post deleted`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
