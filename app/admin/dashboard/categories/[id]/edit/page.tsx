import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import {
  AdminFormCard,
  AdminPage,
  AdminPageHeader,
} from "@/components/admin/admin-ui";
import { getAdminDataClient } from "@/lib/admin/auth";

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tenant?: string }>;
};

export default async function EditCategoryPage({ params, searchParams }: EditCategoryPageProps) {
  const { id } = await params;
  const { tenant: tenantSlug } = await searchParams;
  const db = await getAdminDataClient();

  const { data: category, error } = await db
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !category) {
    notFound();
  }

  const { data: tenants } = await db
    .from("tenants")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const tenantList = tenants ?? [];
  const selectedTenant =
    tenantList.find((tenant) => tenant.slug === tenantSlug || tenant.id === category.tenant_id) ??
    tenantList.find((tenant) => tenant.id === category.tenant_id) ??
    null;

  const { data: categories } = await db
    .from("categories")
    .select("id, name")
    .eq("tenant_id", category.tenant_id)
    .order("name", { ascending: true });

  return (
    <AdminPage>
      <AdminPageHeader
        title="Edit Category"
        description={`Update category details for ${selectedTenant?.name ?? "your store"}.`}
      />

      <AdminFormCard>
        <CategoryForm
          mode="edit"
          tenants={tenantList}
          categories={categories ?? []}
          initial={category}
          defaultTenantId={category.tenant_id}
          defaultTenantSlug={selectedTenant?.slug}
        />
      </AdminFormCard>
    </AdminPage>
  );
}
