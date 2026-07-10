import Link from "next/link";
import { requireTenantManager } from "@/lib/auth/business-access";
import { HeroBannerForm } from "@/components/business/HeroBannerForm";
import { AdminFormCard } from "@/components/admin/admin-ui";

export default async function NewBannerPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, status, is_active")
    .eq("tenant_id", tenant.id)
    .order("name");

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/business/${tenant.slug}/banners`}
          className="text-sm text-gray-500 hover:text-primary"
        >
          ← Back to banners
        </Link>
        <h2 className="mt-1.5 text-lg font-semibold text-gray-900">
          Create hero banner
        </h2>
        <p className="mt-0.5 text-[13px] text-gray-500">
          Add a slider slide with desktop and optional mobile images. Link a
          product so shoppers land on the PDP.
        </p>
      </div>

      <AdminFormCard>
        <HeroBannerForm
          mode="create"
          tenantSlug={tenant.slug}
          products={products ?? []}
        />
      </AdminFormCard>
    </div>
  );
}
