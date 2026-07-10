import Link from "next/link";
import { requireTenantManager } from "@/lib/auth/business-access";
import { CollectionForm } from "@/components/business/CollectionForm";
import { AdminFormCard } from "@/components/admin/admin-ui";

export default async function NewCollectionPage({
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
          href={`/business/${tenant.slug}/collections`}
          className="text-sm text-gray-500 hover:text-primary"
        >
          ← Back to collections
        </Link>
        <h2 className="mt-1.5 text-lg font-semibold text-gray-900">Create collection</h2>
        <p className="mt-1 text-sm text-gray-500">
          Group products into a curated storefront collection.
        </p>
      </div>

      <AdminFormCard>
        <CollectionForm mode="create" tenantSlug={tenant.slug} />
      </AdminFormCard>
    </div>
  );
}
