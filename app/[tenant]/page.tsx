import Link from "next/link";

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ tenant?: string | string[] }>;
}) {
  const tenant = (await params).tenant;
  const tenantSlug = Array.isArray(tenant) ? tenant[0] : (tenant ?? "store");

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {tenantSlug}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Welcome to your storefront
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          This is the initial storefront shell for your multi-tenant e-commerce
          MVP. Product catalog, cart, wishlist, and checkout flows will be added
          in the next phases.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/${tenantSlug}/products`}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Browse products
          </Link>
          <Link
            href={`/${tenantSlug}/cart`}
            className="rounded-md border px-4 py-2 text-sm font-medium"
          >
            View cart
          </Link>
        </div>
      </section>
    </div>
  );
}
