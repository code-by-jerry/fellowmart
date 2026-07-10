import Link from "next/link";
import { requireTenantManager } from "@/lib/auth/business-access";
import { listFieldDefinitions } from "@/lib/catalog/product-service";
import { listTags } from "@/lib/catalog/tag-service";
import { ProductForm } from "@/components/business/ProductForm";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const [
    { data: categories },
    { data: collections },
    { data: brands },
    tagSuggestions,
    fieldDefinitions,
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name")
      .eq("tenant_id", tenant.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("collections")
      .select("id, name")
      .eq("tenant_id", tenant.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("brands")
      .select("id, name")
      .eq("tenant_id", tenant.id)
      .eq("is_active", true)
      .order("sort_order")
      .order("name"),
    listTags(supabase, tenant.id, { activeOnly: true, limit: 40 }),
    listFieldDefinitions(supabase, tenant.id),
  ]);

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/business/${tenant.slug}/products`}
          className="text-sm text-gray-500 hover:text-primary"
        >
          ← Back to products
        </Link>
        <h2 className="mt-1.5 text-lg font-semibold text-gray-900">Create product</h2>
        <p className="mt-0.5 text-[13px] text-gray-500">
          Catalog entry with SKU, variants, specifications, and custom fields.
        </p>
      </div>

      <ProductForm
        tenantSlug={tenant.slug}
        categories={categories ?? []}
        collections={collections ?? []}
        brands={brands ?? []}
        tagSuggestions={tagSuggestions}
        fieldDefinitions={fieldDefinitions}
        mode="create"
      />
    </div>
  );
}
