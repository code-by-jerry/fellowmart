import Link from "next/link";
import { requireTenantManager } from "@/lib/auth/business-access";
import { StorePageForm } from "@/components/business/StorePageForm";
import { AdminFormCard } from "@/components/admin/admin-ui";

export default async function NewStorePagePage({
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
          href={`/business/${tenant.slug}/pages`}
          className="text-sm text-gray-500 hover:text-primary"
        >
          ← Back to pages
        </Link>
        <h2 className="mt-1.5 text-lg font-semibold text-gray-900">
          Create page
        </h2>
        <p className="mt-0.5 text-[13px] text-gray-500">
          Add a company or help page with its own URL slug (like Shopify pages).
        </p>
      </div>

      <AdminFormCard>
        <StorePageForm mode="create" tenantSlug={tenant.slug} />
      </AdminFormCard>
    </div>
  );
}
