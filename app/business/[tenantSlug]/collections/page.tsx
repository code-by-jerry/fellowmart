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

type BusinessCollectionsPageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ success?: string }>;
};

export default async function BusinessCollectionsPage({
  params,
  searchParams,
}: BusinessCollectionsPageProps) {
  const { tenantSlug } = await params;
  const { success } = await searchParams;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, slug, is_active, sort_order")
    .eq("tenant_id", tenant.id)
    .order("sort_order");

  return (
    <div className="space-y-3">
      {success ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700">
          {success}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] text-gray-500">
          Curated product groups for your storefront.
        </p>
        <Link
          href={`/business/${tenant.slug}/collections/new`}
          className={adminBtnPrimaryClass}
        >
          <Plus size={14} />
          Add collection
        </Link>
      </div>

      <AdminPanel>
        {(collections ?? []).length === 0 ? (
          <AdminEmptyState message="No collections yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-200 bg-[#f7f7f7]">
                  <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                    Slug
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
                {(collections ?? []).map((collection) => (
                  <tr
                    key={collection.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-3 py-2.5 font-medium text-gray-900">
                      {collection.name}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">{collection.slug}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium ${
                          collection.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {collection.is_active ? "active" : "hidden"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/business/${tenant.slug}/collections/${collection.id}/edit`}
                          className={adminBtnSecondaryClass}
                        >
                          <Pencil size={13} />
                          Edit
                        </Link>
                        <CatalogDeleteButton
                          tenantSlug={tenant.slug}
                          itemId={collection.id}
                          itemLabel={collection.name}
                          endpoint="/api/business/collections/delete"
                          bodyKey="collection_id"
                          redirectPath={`/business/${tenant.slug}/collections?success=Collection deleted`}
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
