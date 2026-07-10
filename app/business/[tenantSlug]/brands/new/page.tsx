import Link from "next/link";
import { requireTenantManager } from "@/lib/auth/business-access";
import { BrandForm } from "@/components/business/BrandForm";
import { AdminFormCard } from "@/components/admin/admin-ui";

export default async function NewBrandPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { tenant } = await requireTenantManager(tenantSlug);

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/business/${tenant.slug}/brands`}
          className="text-sm text-gray-500 hover:text-primary"
        >
          ← Back to brands
        </Link>
        <h2 className="mt-1.5 text-lg font-semibold text-gray-900">Create brand</h2>
        <p className="mt-0.5 text-[13px] text-gray-500">
          Onboard a brand so you can assign it to products dynamically.
        </p>
      </div>

      <AdminFormCard>
        <BrandForm mode="create" tenantSlug={tenant.slug} />
      </AdminFormCard>
    </div>
  );
}
