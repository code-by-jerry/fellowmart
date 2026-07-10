import Link from "next/link";
import { requireTenantManager } from "@/lib/auth/business-access";
import { CategoryForm } from "@/components/business/CategoryForm";
import { AdminFormCard } from "@/components/admin/admin-ui";

export default async function NewCategoryPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("tenant_id", tenant.id)
    .order("name");

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/business/${tenant.slug}/categories`}
          className="text-sm text-gray-500 hover:text-primary"
        >
          ← Back to categories
        </Link>
        <h2 className="mt-1.5 text-lg font-semibold text-gray-900">Create category</h2>
        <p className="mt-0.5 text-[13px] text-gray-500">
          Add a category to organize products on your storefront.
        </p>
      </div>

      <AdminFormCard>
        <CategoryForm
          mode="create"
          tenantSlug={tenant.slug}
          tenantId={tenant.id}
          categories={categories ?? []}
        />
      </AdminFormCard>
    </div>
  );
}
