import Link from "next/link";
import { Package } from "lucide-react";
import { requireTenantManager } from "@/lib/auth/business-access";
import { BusinessShell } from "@/components/business/BusinessShell";

export default async function TenantProductsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data: products } = await supabase
    .from("products")
    .select("id, name, sku, price, is_active, created_at")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: false });

  return (
    <BusinessShell tenantSlug={tenant.slug} tenantName={tenant.name}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Products</h2>
            <p className="text-sm text-gray-500">Manage your store catalog.</p>
          </div>
          <Link
            href={`/business/${tenant.slug}/products`}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Manage products
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white">
          {(products ?? []).length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-gray-500">
              <Package className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              No products yet.
            </div>
          ) : (
            <div className="divide-y">
              {(products ?? []).map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.sku ? `SKU: ${product.sku}` : "No SKU"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{Number(product.price ?? 0).toFixed(2)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {product.is_active ? "active" : "draft"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BusinessShell>
  );
}
