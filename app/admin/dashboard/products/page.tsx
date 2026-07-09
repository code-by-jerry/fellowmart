import { PlusCircle, Package } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AdminEmptyState,
  AdminListHeader,
  AdminPage,
} from "@/components/admin/admin-ui";
import { createAdminClient } from "@/utils/supabase/admin-server";

export default async function ProductsPage() {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminPage className="space-y-4 sm:space-y-6">
      <AdminListHeader
        title="Products"
        description="Manage your store catalog."
        action={
          <Link
            href="/admin/dashboard/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <PlusCircle size={16} />
            New Product
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {(products ?? []).length === 0 ? (
          <div className="col-span-full rounded-2xl border border-gray-200 bg-white shadow-sm">
            <AdminEmptyState
              icon={<Package className="mx-auto h-8 w-8" />}
              message="No products yet. Add your first product to start selling."
            />
          </div>
        ) : (
          (products ?? []).map((product: any) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {product.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-40 w-full object-cover sm:h-44"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-gray-100 sm:h-44">
                  <Package className="h-10 w-10 text-gray-300" />
                </div>
              )}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">{product.name}</h3>
                    {product.sku && (
                      <p className="mt-0.5 text-xs text-gray-400">SKU: {product.sku}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      product.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {product.is_active ? "active" : "draft"}
                  </span>
                </div>
                <div className="mt-3 text-sm font-semibold text-gray-900">
                  ₹{Number(product.price ?? 0).toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminPage>
  );
}
