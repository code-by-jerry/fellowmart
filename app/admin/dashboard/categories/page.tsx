import Link from "next/link";
import { FolderTree, Pencil, PlusCircle, Trash2 } from "lucide-react";
import {
  AdminEmptyState,
  AdminListHeader,
  AdminPage,
  AdminPanel,
} from "@/components/admin/admin-ui";
import { getAdminDataClient } from "@/lib/admin/auth";

type CategoriesPageProps = {
  searchParams: Promise<{ tenant?: string }>;
};

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const { tenant: tenantSlug } = await searchParams;
  const db = await getAdminDataClient();

  const { data: tenants } = await db
    .from("tenants")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const tenantList = tenants ?? [];
  const selectedTenant =
    tenantList.find((tenant) => tenant.slug === tenantSlug) ?? tenantList[0] ?? null;

  const { data: categories } = selectedTenant
    ? await db
        .from("categories")
        .select("id, name, slug, sort_order, is_active, parent_category_id, created_at")
        .eq("tenant_id", selectedTenant.id)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true })
    : { data: [] };

  const categoryList = categories ?? [];

  return (
    <AdminPage className="space-y-4 sm:space-y-6">
      <AdminListHeader
        title="Categories"
        description="Manage product categories per store."
        action={
          selectedTenant ? (
            <Link
              href={`/admin/dashboard/categories/new?tenant=${selectedTenant.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <PlusCircle size={16} />
              New Category
            </Link>
          ) : undefined
        }
      />

      {tenantList.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
          {tenantList.map((tenant) => {
            const active = tenant.id === selectedTenant?.id;
            return (
              <Link
                key={tenant.id}
                href={`/admin/dashboard/categories?tenant=${tenant.slug}`}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                }`}
              >
                {tenant.name}
              </Link>
            );
          })}
        </div>
      )}

      <AdminPanel>
        {tenantList.length === 0 ? (
          <AdminEmptyState
            icon={<FolderTree className="mx-auto h-8 w-8" />}
            message="Create a store first before adding categories."
          />
        ) : categoryList.length === 0 ? (
          <AdminEmptyState
            icon={<FolderTree className="mx-auto h-8 w-8" />}
            message={`No categories for ${selectedTenant?.name}. Add your first category.`}
          />
        ) : (
          <>
            <div className="divide-y md:hidden">
              {categoryList.map((category) => (
                <div key={category.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-xs text-gray-500">{category.slug}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        category.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {category.is_active ? "active" : "hidden"}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    Sort order: {category.sort_order ?? 0}
                  </p>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={`/admin/dashboard/categories/${category.id}/edit?tenant=${selectedTenant?.slug}`}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Pencil size={14} />
                      Edit
                    </Link>
                    <form action="/api/admin/categories/delete" method="post">
                      <input type="hidden" name="category_id" value={category.id} />
                      <input type="hidden" name="tenant_id" value={selectedTenant?.id ?? ""} />
                      <input type="hidden" name="tenant_slug" value={selectedTenant?.slug ?? ""} />
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Slug</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Sort</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryList.map((category) => (
                    <tr key={category.id} className="border-t last:border-b">
                      <td className="px-4 py-3 font-medium text-gray-900">{category.name}</td>
                      <td className="px-4 py-3 text-gray-500">{category.slug}</td>
                      <td className="px-4 py-3 text-gray-500">{category.sort_order ?? 0}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            category.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {category.is_active ? "active" : "hidden"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/dashboard/categories/${category.id}/edit?tenant=${selectedTenant?.slug}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil size={14} />
                            Edit
                          </Link>
                          <form action="/api/admin/categories/delete" method="post">
                            <input type="hidden" name="category_id" value={category.id} />
                            <input type="hidden" name="tenant_id" value={selectedTenant?.id ?? ""} />
                            <input type="hidden" name="tenant_slug" value={selectedTenant?.slug ?? ""} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AdminPanel>
    </AdminPage>
  );
}
