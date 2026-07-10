import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenantManager } from "@/lib/auth/business-access";
import { BrandForm } from "@/components/business/BrandForm";
import { AdminFormCard } from "@/components/admin/admin-ui";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>;
}) {
  const { tenantSlug, id } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data: brand, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (error || !brand) notFound();

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/business/${tenant.slug}/brands`}
          className="text-sm text-gray-500 hover:text-primary"
        >
          ← Back to brands
        </Link>
        <h2 className="mt-1.5 text-lg font-semibold text-gray-900">Edit brand</h2>
        <p className="mt-0.5 text-[13px] text-gray-500">{brand.name}</p>
      </div>

      <AdminFormCard>
        <BrandForm mode="edit" tenantSlug={tenant.slug} initial={brand} />
      </AdminFormCard>
    </div>
  );
}
