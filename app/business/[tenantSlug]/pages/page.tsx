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
import { storePath } from "@/lib/routes/store-routes";

type BusinessPagesPageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function BusinessPagesPage({
  params,
  searchParams,
}: BusinessPagesPageProps) {
  const { tenantSlug } = await params;
  const { success, error } = await searchParams;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data: pages } = await supabase
    .from("store_pages")
    .select(
      "id, title, slug, status, is_active, footer_group, show_in_footer, sort_order",
    )
    .eq("tenant_id", tenant.id)
    .order("sort_order")
    .order("title");

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
          Create About, Policies, Shipping, Refunds, and other info pages.
          Published pages live at{" "}
          <code className="rounded bg-gray-100 px-1">
            /store/{tenant.slug}/pages/…
          </code>
        </p>
        <Link
          href={`/business/${tenant.slug}/pages/new`}
          className={adminBtnPrimaryClass}
        >
          <Plus size={14} />
          New page
        </Link>
      </div>

      <AdminPanel>
        {(pages ?? []).length === 0 ? (
          <AdminEmptyState message="No custom pages yet. Add Privacy Policy, Shipping, About Us, and more." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-200 bg-[#f7f7f7]">
                  <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                    Page
                  </th>
                  <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                    Footer
                  </th>
                  <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-3 py-2 text-right text-[12px] font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {(pages ?? []).map((page) => (
                  <tr
                    key={page.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-3 py-2.5">
                      <span className="font-medium text-gray-900">
                        {page.title}
                      </span>
                      <p className="text-[11px] text-gray-500">
                        /pages/{page.slug}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 capitalize text-gray-500">
                      {page.show_in_footer && page.footer_group !== "none"
                        ? page.footer_group
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium ${
                          page.status === "published" && page.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {page.status === "published" && page.is_active
                          ? "published"
                          : page.status === "published"
                            ? "hidden"
                            : "draft"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {page.status === "published" && page.is_active ? (
                          <Link
                            href={storePath(tenant.slug, `pages/${page.slug}`)}
                            className={adminBtnSecondaryClass}
                            target="_blank"
                          >
                            View
                          </Link>
                        ) : null}
                        <Link
                          href={`/business/${tenant.slug}/pages/${page.id}/edit`}
                          className={adminBtnSecondaryClass}
                        >
                          <Pencil size={13} />
                          Edit
                        </Link>
                        <CatalogDeleteButton
                          tenantSlug={tenant.slug}
                          itemId={page.id}
                          itemLabel={page.title}
                          endpoint="/api/business/pages/delete"
                          bodyKey="page_id"
                          redirectPath={`/business/${tenant.slug}/pages?success=Page deleted`}
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
