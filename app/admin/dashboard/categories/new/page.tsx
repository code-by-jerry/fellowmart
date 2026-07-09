import { CategoryForm } from "@/components/admin/CategoryForm";
import {
  AdminFormCard,
  AdminPage,
  AdminPageHeader,
} from "@/components/admin/admin-ui";
import { getAdminDataClient } from "@/lib/admin/auth";

type NewCategoryPageProps = {
  searchParams: Promise<{ tenant?: string }>;
};

export default async function NewCategoryPage({ searchParams }: NewCategoryPageProps) {
  const { tenant: tenantSlug } = await searchParams;
  const db = await getAdminDataClient();

  const { data: tenants } = await db
    .from("tenants")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const tenantList = tenants ?? [];
  const selectedTenant =
    tenantList.find((tenant) => tenant.slug === tenantSlug) ?? tenantList[0] ?? null;

  const { data: categories } = selectedTenant
    ? await db
        .from("categories")
        .select("id, name")
        .eq("tenant_id", selectedTenant.id)
        .order("name", { ascending: true })
    : { data: [] };

  return (
    <AdminPage>
      <AdminPageHeader
        title="Create Category"
        description="Add a new category to organize products in your store."
      />

      <AdminFormCard>
        {tenantList.length === 0 ? (
          <p className="text-sm text-gray-500">Create a store before adding categories.</p>
        ) : (
          <CategoryForm
            mode="create"
            tenants={tenantList}
            categories={categories ?? []}
            defaultTenantId={selectedTenant?.id}
            defaultTenantSlug={selectedTenant?.slug}
          />
        )}
      </AdminFormCard>
    </AdminPage>
  );
}
