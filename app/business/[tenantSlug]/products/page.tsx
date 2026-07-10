import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { requireTenantManager } from "@/lib/auth/business-access";
import { CatalogDeleteButton } from "@/components/business/CatalogDeleteButton";
import { productStorefrontPath } from "@/components/business/StorefrontPreviewLink";
import {
  adminBtnPrimaryClass,
  adminBtnSecondaryClass,
  AdminEmptyState,
  AdminPanel,
} from "@/components/admin/admin-ui";

type TenantProductsPageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ success?: string }>;
};

export default async function TenantProductsPage({
  params,
  searchParams,
}: TenantProductsPageProps) {
  const { tenantSlug } = await params;
  const { success } = await searchParams;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, sku, slug, price, compare_at_price, status, has_variants, stock_quantity, is_active, created_at, categories(slug)",
    )
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-3">
      {success ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700">
          {success}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] text-gray-500">
          Catalog with SKUs, variants, and custom fields.
        </p>
        <Link
          href={`/business/${tenant.slug}/products/new`}
          className={adminBtnPrimaryClass}
        >
          <Plus size={14} />
          Add product
        </Link>
      </div>

      <AdminPanel>
        {(products ?? []).length === 0 ? (
          <AdminEmptyState message="No products yet. Create your first product." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-200 bg-[#f7f7f7]">
                  <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                    Product
                  </th>
                  <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                    Price
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
                {(products ?? []).map((product) => {
                  const categorySlug = (
                    product.categories as { slug?: string } | null | undefined
                  )?.slug;
                  const canPreview =
                    product.status === "active" &&
                    product.is_active &&
                    product.slug &&
                    categorySlug;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-[12px] text-gray-500">
                          SKU: {product.sku}
                          {product.has_variants ? " · Variants" : ""}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900">
                        ₹{Number(product.price ?? 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium ${
                            product.status === "active" && product.is_active
                              ? "bg-green-50 text-green-700"
                              : product.status === "archived"
                                ? "bg-gray-100 text-gray-500"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {product.status ?? "draft"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {canPreview ? (
                            <a
                              href={productStorefrontPath(
                                tenant.slug,
                                categorySlug,
                                product.slug,
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className={adminBtnSecondaryClass}
                            >
                              <ExternalLink size={13} />
                              View
                            </a>
                          ) : null}
                          <Link
                            href={`/business/${tenant.slug}/products/${product.id}/edit`}
                            className={adminBtnSecondaryClass}
                          >
                            <Pencil size={13} />
                            Edit
                          </Link>
                          <CatalogDeleteButton
                            tenantSlug={tenant.slug}
                            itemId={product.id}
                            itemLabel={product.name}
                            endpoint="/api/business/products/delete"
                            bodyKey="product_id"
                            redirectPath={`/business/${tenant.slug}/products?success=Product deleted`}
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
