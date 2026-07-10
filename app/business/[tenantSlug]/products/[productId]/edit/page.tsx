import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTenantManager } from "@/lib/auth/business-access";
import {
  getProductForEdit,
  listFieldDefinitions,
} from "@/lib/catalog/product-service";
import { listTags } from "@/lib/catalog/tag-service";
import { ProductForm } from "@/components/business/ProductForm";
import {
  productStorefrontPath,
  StorefrontPreviewLink,
} from "@/components/business/StorefrontPreviewLink";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; productId: string }>;
}) {
  const { tenantSlug, productId } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const [
    product,
    { data: categories },
    { data: collections },
    { data: brands },
    tagSuggestions,
    fieldDefinitions,
  ] = await Promise.all([
      getProductForEdit(supabase, tenant.id, productId),
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

  if (!product) notFound();

  const { data: category } = product.category_id
    ? await supabase
        .from("categories")
        .select("slug")
        .eq("id", product.category_id)
        .maybeSingle()
    : { data: null };

  const canPreview =
    product.status === "active" &&
    product.is_active &&
    Boolean(product.slug) &&
    Boolean(category?.slug);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/business/${tenant.slug}/products`}
            className="text-sm text-gray-500 hover:text-primary"
          >
            ← Back to products
          </Link>
          <h2 className="mt-1.5 text-lg font-semibold text-gray-900">Edit product</h2>
          <p className="mt-0.5 text-[13px] text-gray-500">{product.name}</p>
        </div>
        {canPreview ? (
          <StorefrontPreviewLink
            tenantSlug={tenant.slug}
            href={productStorefrontPath(tenant.slug, category?.slug, product.slug)}
            label="Preview on store"
          />
        ) : null}
      </div>

      <ProductForm
        tenantSlug={tenant.slug}
        categories={categories ?? []}
        collections={collections ?? []}
        brands={brands ?? []}
        tagSuggestions={tagSuggestions}
        fieldDefinitions={fieldDefinitions}
        initial={product}
        productId={product.id}
        mode="edit"
      />
    </div>
  );
}
