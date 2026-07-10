import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenantManager } from "@/lib/auth/business-access";
import { StorePageForm } from "@/components/business/StorePageForm";
import { AdminFormCard } from "@/components/admin/admin-ui";

export default async function EditStorePagePage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>;
}) {
  const { tenantSlug, id } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data: page, error } = await supabase
    .from("store_pages")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (error || !page) notFound();

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
          Edit page
        </h2>
        <p className="mt-0.5 text-[13px] text-gray-500">{page.title}</p>
      </div>

      <AdminFormCard>
        <StorePageForm mode="edit" tenantSlug={tenant.slug} initial={page} />
      </AdminFormCard>
    </div>
  );
}
