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

type BusinessBannersPageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function BusinessBannersPage({
  params,
  searchParams,
}: BusinessBannersPageProps) {
  const { tenantSlug } = await params;
  const { success, error } = await searchParams;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data: banners } = await supabase
    .from("hero_banners")
    .select(
      "id, title, eyebrow, desktop_image_url, mobile_image_url, product_id, sort_order, is_active, products(name)",
    )
    .eq("tenant_id", tenant.id)
    .order("sort_order")
    .order("created_at");

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
          Homepage hero slider. Link each slide to a product PDP. Upload separate
          desktop and mobile images.
        </p>
        <Link
          href={`/business/${tenant.slug}/banners/new`}
          className={adminBtnPrimaryClass}
        >
          <Plus size={14} />
          Add banner
        </Link>
      </div>

      <AdminPanel>
        {(banners ?? []).length === 0 ? (
          <AdminEmptyState message="No hero banners yet. Add slides to replace the default homepage hero." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-200 bg-[#f7f7f7]">
                  <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                    Banner
                  </th>
                  <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                    Linked product
                  </th>
                  <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                    Order
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
                {(banners ?? []).map((banner) => {
                  const product = Array.isArray(banner.products)
                    ? banner.products[0]
                    : banner.products;
                  return (
                    <tr
                      key={banner.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          {banner.desktop_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={banner.desktop_image_url}
                              alt=""
                              className="h-10 w-16 rounded border border-gray-200 bg-white object-cover"
                            />
                          ) : (
                            <div className="h-10 w-16 rounded bg-gray-100" />
                          )}
                          <div>
                            <span className="font-medium text-gray-900">
                              {banner.title}
                            </span>
                            {banner.eyebrow ? (
                              <p className="text-[11px] text-gray-500">
                                {banner.eyebrow}
                              </p>
                            ) : null}
                            <p className="text-[11px] text-gray-400">
                              {banner.mobile_image_url
                                ? "Desktop + mobile"
                                : "Desktop only"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">
                        {product?.name ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">
                        {banner.sort_order}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium ${
                            banner.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {banner.is_active ? "active" : "hidden"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/business/${tenant.slug}/banners/${banner.id}/edit`}
                            className={adminBtnSecondaryClass}
                          >
                            <Pencil size={13} />
                            Edit
                          </Link>
                          <CatalogDeleteButton
                            tenantSlug={tenant.slug}
                            itemId={banner.id}
                            itemLabel={banner.title}
                            endpoint="/api/business/banners/delete"
                            bodyKey="banner_id"
                            redirectPath={`/business/${tenant.slug}/banners?success=Banner deleted`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
