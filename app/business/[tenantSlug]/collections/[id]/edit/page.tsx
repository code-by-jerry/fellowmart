import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenantManager } from "@/lib/auth/business-access";
import { CollectionForm } from "@/components/business/CollectionForm";
import { AdminFormCard } from "@/components/admin/admin-ui";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>;
}) {
  const { tenantSlug, id } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (!collection) {
    notFound();
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/business/${tenant.slug}/collections`}
          className="text-sm text-gray-500 hover:text-primary"
        >
          ← Back to collections
        </Link>
        <h2 className="mt-1.5 text-lg font-semibold text-gray-900">Edit collection</h2>
        <p className="mt-1 text-sm text-gray-500">Update {collection.name}.</p>
      </div>

      <AdminFormCard>
        <CollectionForm
          mode="edit"
          tenantSlug={tenant.slug}
          initial={collection}
        />
      </AdminFormCard>
    </div>
  );
}
