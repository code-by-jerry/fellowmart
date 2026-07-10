import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenantManager } from "@/lib/auth/business-access";
import { CategoryForm } from "@/components/business/CategoryForm";
import { AdminFormCard } from "@/components/admin/admin-ui";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>;
}) {
  const { tenantSlug, id } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (!category) {
    notFound();
  }

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
        <h2 className="mt-1.5 text-lg font-semibold text-gray-900">Edit category</h2>
        <p className="mt-1 text-sm text-gray-500">Update {category.name}.</p>
      </div>

      <AdminFormCard>
        <CategoryForm
          mode="edit"
          tenantSlug={tenant.slug}
          tenantId={tenant.id}
          categories={categories ?? []}
          initial={category}
        />
      </AdminFormCard>
    </div>
  );
}
