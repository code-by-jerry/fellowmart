import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenantManager } from "@/lib/auth/business-access";
import { HeroBannerForm } from "@/components/business/HeroBannerForm";
import { AdminFormCard } from "@/components/admin/admin-ui";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>;
}) {
  const { tenantSlug, id } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const [{ data: banner, error }, { data: products }] = await Promise.all([
    supabase
      .from("hero_banners")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenant.id)
      .maybeSingle(),
    supabase
      .from("products")
      .select("id, name, slug, status, is_active")
      .eq("tenant_id", tenant.id)
      .order("name"),
  ]);

  if (error || !banner) notFound();

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
          Edit hero banner
        </h2>
        <p className="mt-0.5 text-[13px] text-gray-500">{banner.title}</p>
      </div>

      <AdminFormCard>
        <HeroBannerForm
          mode="edit"
          tenantSlug={tenant.slug}
          products={products ?? []}
          initial={banner}
        />
      </AdminFormCard>
    </div>
  );
}
