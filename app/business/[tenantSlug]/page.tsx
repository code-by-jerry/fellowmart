import { requireTenantManager } from "@/lib/auth/business-access";
import {
  BusinessStatCard,
} from "@/components/business/BusinessShell";
import { StorefrontPreviewLink } from "@/components/business/StorefrontPreviewLink";
import { BUSINESS_TYPES } from "@/lib/types/business";
import Link from "next/link";

const TYPE_LABELS = Object.fromEntries(
  BUSINESS_TYPES.map((type) => [type.value, type.label]),
);

type TenantDashboardPageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
};

export default async function TenantDashboardPage({
  params,
  searchParams,
}: TenantDashboardPageProps) {
  const { tenantSlug } = await params;
  const { error, success } = await searchParams;
  const { supabase, tenant, role } = await requireTenantManager(tenantSlug);

  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenant.id),
    supabase
      .from("categories")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenant.id),
  ]);

  return (
    <>
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <p className="text-sm text-gray-500">Welcome back</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">{tenant.name}</h2>
          <p className="mt-2 text-sm text-gray-500">
            {TYPE_LABELS[tenant.business_type] ?? tenant.business_type} · Role: {role}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <StorefrontPreviewLink tenantSlug={tenant.slug} label="View public store" />
            <Link
              href={`/business/${tenant.slug}/products`}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Manage products
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <BusinessStatCard label="Products" value={productsResult.count ?? 0} />
          <BusinessStatCard label="Categories" value={categoriesResult.count ?? 0} />
          <BusinessStatCard
            label="Store status"
            value={tenant.is_active ? "Live" : "Inactive"}
            hint={tenant.onboarding_status ?? "pending"}
          />
        </div>
      </div>
    </>
  );
}
