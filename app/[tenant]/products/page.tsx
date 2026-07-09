import Link from "next/link";
import { getTenantCatalog } from "@/lib/catalog/tenant-catalog";

export default async function TenantProductsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const data = await getTenantCatalog(tenant);

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Store not found
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          The requested tenant could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          {data.tenant.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">Products</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 md:col-span-2 xl:col-span-3">
            No products available yet for this store.
          </div>
        ) : (
          data.products.map((product: any) => (
            <div
              key={product.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <p className="mt-2 text-sm text-gray-500">
                {product.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  ₹{Number(product.price ?? 0).toFixed(2)}
                </span>
                <Link
                  href={`/${tenant}/products/${product.slug}`}
                  className="text-sm font-medium text-primary"
                >
                  View
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
