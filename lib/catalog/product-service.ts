import type { SupabaseClient } from "@supabase/supabase-js";
import { deriveStockStatus } from "@/lib/catalog/product-sku";
import { ensureTagsExist, refreshTagUsageCounts } from "@/lib/catalog/tag-service";
import type {
  ProductFieldDefinition,
  ProductFormInput,
  ProductRecord,
} from "@/lib/types/product";

function productRowFromInput(tenantId: string, input: ProductFormInput) {
  const isActive = input.status === "active" && input.is_active !== false;
  const stockStatus =
    input.stock_status ??
    deriveStockStatus(
      input.stock_quantity ?? 0,
      input.low_stock_threshold ?? 5,
      input.allow_backorder ?? false,
    );

  return {
    tenant_id: tenantId,
    name: input.name.trim(),
    slug: input.slug.trim(),
    brand: input.brand?.trim() || null,
    brand_id: input.brand_id || null,
    subtitle: input.subtitle?.trim() || null,
    description: input.description?.trim() || null,
    long_description: input.long_description?.trim() || null,
    category_id: input.category_id || null,
    tags: input.tags ?? [],
    status: input.status ?? "draft",
    is_featured: input.is_featured ?? false,
    is_active: isActive,
    sku: input.sku.trim(),
    barcode: input.barcode?.trim() || null,
    mpn: input.mpn?.trim() || null,
    gtin: input.gtin?.trim() || null,
    hs_code: input.hs_code?.trim() || null,
    has_variants: input.has_variants ?? false,
    price: input.has_variants ? 0 : Number(input.price ?? 0),
    compare_at_price: input.compare_at_price ?? null,
    cost_price: input.cost_price ?? null,
    discount_percent: input.discount_percent ?? 0,
    tax_class: input.tax_class ?? "standard",
    taxable: input.taxable ?? true,
    track_inventory: input.track_inventory ?? true,
    stock_quantity: input.has_variants ? 0 : Number(input.stock_quantity ?? 0),
    low_stock_threshold: input.low_stock_threshold ?? 5,
    allow_backorder: input.allow_backorder ?? false,
    stock_status: input.has_variants ? "in_stock" : stockStatus,
    weight: input.weight ?? null,
    weight_unit: input.weight_unit ?? "kg",
    length: input.length ?? null,
    width: input.width ?? null,
    height: input.height ?? null,
    dimension_unit: input.dimension_unit ?? "cm",
    requires_shipping: input.requires_shipping ?? true,
    shipping_class: input.shipping_class?.trim() || null,
    featured_image_url: input.featured_image_url?.trim() || null,
    images: (input.images ?? []).map((image, index) => ({
      url: image.url,
      alt_text: image.alt_text ?? null,
      sort_order: image.sort_order ?? index,
    })),
    seo_title: input.seo_title?.trim() || null,
    seo_description: input.seo_description?.trim() || null,
    meta_keywords: input.meta_keywords ?? [],
    custom_fields: input.custom_fields ?? {},
    updated_at: new Date().toISOString(),
  };
}

async function upsertFieldDefinitions(
  db: SupabaseClient,
  tenantId: string,
  definitions: ProductFieldDefinition[] | undefined,
) {
  if (!definitions?.length) return;

  for (const definition of definitions) {
    if (!definition.field_key?.trim() || !definition.label?.trim()) continue;

    await db.from("product_field_definitions").upsert(
      {
        tenant_id: tenantId,
        field_key: definition.field_key.trim(),
        label: definition.label.trim(),
        field_type: definition.field_type ?? "text",
        field_group: definition.field_group ?? "Custom",
        description: definition.description ?? null,
        options: definition.options ?? [],
        is_required: definition.is_required ?? false,
        applies_to: definition.applies_to ?? "product",
        sort_order: definition.sort_order ?? 0,
        is_active: definition.is_active ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id,field_key" },
    );
  }
}

async function syncProductImages(
  db: SupabaseClient,
  productId: string,
  images: ProductFormInput["images"],
) {
  await db.from("product_images").delete().eq("product_id", productId);

  if (!images?.length) return;

  await db.from("product_images").insert(
    images.map((image, index) => ({
      product_id: productId,
      url: image.url,
      alt_text: image.alt_text ?? null,
      sort_order: image.sort_order ?? index,
    })),
  );
}

async function syncProductOptions(
  db: SupabaseClient,
  productId: string,
  options: ProductFormInput["options"],
) {
  await db.from("product_options").delete().eq("product_id", productId);

  if (!options?.length) return;

  for (const [optionIndex, option] of options.entries()) {
    const { data: createdOption, error } = await db
      .from("product_options")
      .insert({
        product_id: productId,
        name: option.name.trim(),
        position: option.position ?? optionIndex,
      })
      .select("id")
      .single();

    if (error || !createdOption) continue;

    if (option.values?.length) {
      await db.from("product_option_values").insert(
        option.values.map((value, valueIndex) => ({
          option_id: createdOption.id,
          value: value.value.trim(),
          position: value.position ?? valueIndex,
          swatch_color: value.swatch_color ?? null,
          swatch_image_url: value.swatch_image_url ?? null,
        })),
      );
    }
  }
}

async function syncProductAttributes(
  db: SupabaseClient,
  productId: string,
  attributes: ProductFormInput["attributes"],
) {
  await db.from("product_attributes").delete().eq("product_id", productId);

  if (!attributes?.length) return;

  await db.from("product_attributes").insert(
    attributes.map((attribute, index) => ({
      product_id: productId,
      group_name: attribute.group_name?.trim() || "Specifications",
      attribute_key: attribute.attribute_key.trim(),
      attribute_value: attribute.attribute_value.trim(),
      sort_order: attribute.sort_order ?? index,
    })),
  );
}

async function syncVariants(
  db: SupabaseClient,
  tenantId: string,
  productId: string,
  input: ProductFormInput,
) {
  const existingVariantIds =
    input.variants?.filter((variant) => variant.id).map((variant) => variant.id!) ?? [];

  if (existingVariantIds.length) {
    const { data: staleVariants } = await db
      .from("product_variants")
      .select("id")
      .eq("product_id", productId);

    const staleIds = (staleVariants ?? [])
      .map((variant) => variant.id)
      .filter((id) => !existingVariantIds.includes(id));

    if (staleIds.length) {
      await db.from("product_variants").delete().in("id", staleIds);
    }
  } else {
    await db.from("product_variants").delete().eq("product_id", productId);
  }

  if (!input.has_variants || !input.variants?.length) {
    const { data: defaultVariant } = await db
      .from("product_variants")
      .select("id")
      .eq("product_id", productId)
      .maybeSingle();

    const stockQty = input.stock_quantity ?? 0;
    const variantPayload = {
      product_id: productId,
      sku: input.sku.trim(),
      name: input.name.trim(),
      attributes: {},
      price: Number(input.price ?? 0),
      compare_at_price: input.compare_at_price ?? null,
      cost_price: input.cost_price ?? null,
      barcode: input.barcode?.trim() || null,
      weight: input.weight ?? null,
      weight_unit: input.weight_unit ?? "kg",
      image_url: input.featured_image_url?.trim() || null,
      stock_quantity: stockQty,
      low_stock_threshold: input.low_stock_threshold ?? 5,
      allow_backorder: input.allow_backorder ?? false,
      stock_status:
        input.stock_status ??
        deriveStockStatus(
          stockQty,
          input.low_stock_threshold ?? 5,
          input.allow_backorder ?? false,
        ),
      position: 0,
      is_active: true,
      custom_fields: input.custom_fields ?? {},
      updated_at: new Date().toISOString(),
    };

    if (defaultVariant) {
      await db.from("product_variants").update(variantPayload).eq("id", defaultVariant.id);
    } else {
      await db.from("product_variants").insert(variantPayload);
    }
    return;
  }

  for (const [index, variant] of input.variants.entries()) {
    const stockQty = variant.stock_quantity ?? 0;
    const variantPayload = {
      product_id: productId,
      sku: variant.sku.trim(),
      name: variant.name.trim(),
      attributes: variant.attributes ?? {},
      price: variant.price ?? input.price ?? 0,
      compare_at_price: variant.compare_at_price ?? null,
      cost_price: variant.cost_price ?? null,
      barcode: variant.barcode?.trim() || null,
      weight: variant.weight ?? null,
      weight_unit: variant.weight_unit ?? "kg",
      image_url: variant.image_url?.trim() || null,
      stock_quantity: stockQty,
      low_stock_threshold: variant.low_stock_threshold ?? 5,
      allow_backorder: variant.allow_backorder ?? false,
      stock_status:
        variant.stock_status ??
        deriveStockStatus(
          stockQty,
          variant.low_stock_threshold ?? 5,
          variant.allow_backorder ?? false,
        ),
      position: variant.position ?? index,
      is_active: variant.is_active ?? true,
      custom_fields: variant.custom_fields ?? {},
      updated_at: new Date().toISOString(),
    };

    if (variant.id) {
      await db.from("product_variants").update(variantPayload).eq("id", variant.id);
    } else {
      await db.from("product_variants").insert(variantPayload);
    }
  }

  void tenantId;
}

async function syncProductCollections(
  db: SupabaseClient,
  productId: string,
  collectionIds: string[] | undefined,
) {
  await db.from("product_collections").delete().eq("product_id", productId);

  if (!collectionIds?.length) return;

  await db.from("product_collections").insert(
    collectionIds.map((collectionId, index) => ({
      product_id: productId,
      collection_id: collectionId,
      sort_order: index,
    })),
  );
}

async function syncCustomFieldValues(
  db: SupabaseClient,
  tenantId: string,
  productId: string,
  customFields: Record<string, unknown> | undefined,
) {
  if (!customFields) return;

  const { data: definitions } = await db
    .from("product_field_definitions")
    .select("id, field_key")
    .eq("tenant_id", tenantId)
    .eq("is_active", true);

  const definitionMap = new Map(
    (definitions ?? []).map((definition) => [definition.field_key, definition.id]),
  );

  for (const [fieldKey, value] of Object.entries(customFields)) {
    const definitionId = definitionMap.get(fieldKey);
    if (!definitionId) continue;

    await db.from("product_custom_values").upsert(
      {
        tenant_id: tenantId,
        product_id: productId,
        field_definition_id: definitionId,
        value: value as never,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "product_id,field_definition_id" },
    );
  }
}

export async function saveProduct(
  db: SupabaseClient,
  tenantId: string,
  input: ProductFormInput,
  productId?: string,
): Promise<{ productId: string }> {
  await upsertFieldDefinitions(db, tenantId, input.new_field_definitions);

  const normalizedTags = Array.from(
    new Set(
      (input.tags ?? [])
        .map((tag) => tag.trim().replace(/\s+/g, " "))
        .filter(Boolean),
    ),
  );

  if (normalizedTags.length > 0) {
    await ensureTagsExist(db, tenantId, normalizedTags);
  }

  let brandName = input.brand?.trim() || null;
  if (input.brand_id) {
    const { data: brand } = await db
      .from("brands")
      .select("name")
      .eq("id", input.brand_id)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    brandName = brand?.name ?? brandName;
  } else {
    brandName = null;
  }

  const row = productRowFromInput(tenantId, {
    ...input,
    brand: brandName,
    brand_id: input.brand_id || null,
    tags: normalizedTags,
  });

  let savedProductId = productId;

  if (productId) {
    const { error } = await db.from("products").update(row).eq("id", productId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await db
      .from("products")
      .insert(row)
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Could not create product.");
    savedProductId = data.id;
  }

  if (!savedProductId) throw new Error("Product ID missing after save.");

  await Promise.all([
    syncProductImages(db, savedProductId, input.images),
    syncProductOptions(db, savedProductId, input.options),
    syncProductAttributes(db, savedProductId, input.attributes),
    syncVariants(db, tenantId, savedProductId, input),
    syncCustomFieldValues(db, tenantId, savedProductId, input.custom_fields),
    syncProductCollections(db, savedProductId, input.collection_ids),
  ]);

  try {
    await refreshTagUsageCounts(db, tenantId);
  } catch {
    // Non-blocking: product save should succeed even if usage recount fails
  }

  return { productId: savedProductId };
}

export async function getProductForEdit(
  db: SupabaseClient,
  tenantId: string,
  productId: string,
): Promise<ProductRecord | null> {
  const { data: product, error } = await db
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", productId)
    .maybeSingle();

  if (error || !product) return null;

  const [
    { data: images },
    { data: options },
    { data: attributes },
    { data: variants },
    { data: fieldDefinitions },
    { data: customValues },
    { data: productCollections },
  ] = await Promise.all([
    db
      .from("product_images")
      .select("id, url, alt_text, sort_order")
      .eq("product_id", productId)
      .order("sort_order"),
    db
      .from("product_options")
      .select("id, name, position, product_option_values(id, value, position, swatch_color, swatch_image_url)")
      .eq("product_id", productId)
      .order("position"),
    db
      .from("product_attributes")
      .select("id, group_name, attribute_key, attribute_value, sort_order")
      .eq("product_id", productId)
      .order("sort_order"),
    db
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("position"),
    db
      .from("product_field_definitions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .order("sort_order"),
    db
      .from("product_custom_values")
      .select("value, product_field_definitions(field_key)")
      .eq("product_id", productId),
    db
      .from("product_collections")
      .select("collection_id")
      .eq("product_id", productId)
      .order("sort_order"),
  ]);

  const customFields: Record<string, unknown> = {};
  for (const entry of customValues ?? []) {
    const fieldKey = (entry.product_field_definitions as { field_key?: string } | null)
      ?.field_key;
    if (fieldKey) customFields[fieldKey] = entry.value;
  }

  void fieldDefinitions;

  return {
    id: product.id,
    tenant_id: product.tenant_id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    brand_id: product.brand_id ?? null,
    subtitle: product.subtitle,
    description: product.description,
    long_description: product.long_description,
    category_id: product.category_id,
    collection_ids: (productCollections ?? []).map((row) => row.collection_id),
    tags: product.tags ?? [],
    status: product.status ?? "draft",
    is_featured: product.is_featured ?? false,
    is_active: product.is_active ?? false,
    sku: product.sku,
    barcode: product.barcode,
    mpn: product.mpn,
    gtin: product.gtin,
    hs_code: product.hs_code,
    has_variants: product.has_variants ?? false,
    price: Number(product.price ?? 0),
    compare_at_price: product.compare_at_price,
    cost_price: product.cost_price,
    discount_percent: Number(product.discount_percent ?? 0),
    tax_class: product.tax_class ?? "standard",
    taxable: product.taxable ?? true,
    track_inventory: product.track_inventory ?? true,
    stock_quantity: product.stock_quantity ?? 0,
    low_stock_threshold: product.low_stock_threshold ?? 5,
    allow_backorder: product.allow_backorder ?? false,
    stock_status: product.stock_status ?? "in_stock",
    weight: product.weight,
    weight_unit: product.weight_unit ?? "kg",
    length: product.length,
    width: product.width,
    height: product.height,
    dimension_unit: product.dimension_unit ?? "cm",
    requires_shipping: product.requires_shipping ?? true,
    shipping_class: product.shipping_class,
    featured_image_url: product.featured_image_url,
    images:
      images?.map((image) => ({
        id: image.id,
        url: image.url,
        alt_text: image.alt_text,
        sort_order: image.sort_order,
      })) ??
      (Array.isArray(product.images)
        ? product.images.map((image: { url?: string; alt_text?: string; sort_order?: number }, index: number) => ({
            url: image.url ?? "",
            alt_text: image.alt_text ?? null,
            sort_order: image.sort_order ?? index,
          }))
        : []),
    seo_title: product.seo_title,
    seo_description: product.seo_description,
    meta_keywords: product.meta_keywords ?? [],
    options:
      options?.map((option) => ({
        id: option.id,
        name: option.name,
        position: option.position,
        values: (Array.isArray(option.product_option_values)
          ? option.product_option_values
          : []
        ).map((value: {
          id: string;
          value: string;
          position: number;
          swatch_color: string | null;
          swatch_image_url: string | null;
        }) => ({
          id: value.id,
          value: value.value,
          position: value.position,
          swatch_color: value.swatch_color,
          swatch_image_url: value.swatch_image_url,
        })),
      })) ?? [],
    variants:
      variants?.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        name: variant.name,
        attributes: (variant.attributes as Record<string, string>) ?? {},
        price: variant.price,
        compare_at_price: variant.compare_at_price,
        cost_price: variant.cost_price,
        barcode: variant.barcode,
        weight: variant.weight,
        weight_unit: variant.weight_unit,
        image_url: variant.image_url,
        stock_quantity: variant.stock_quantity,
        low_stock_threshold: variant.low_stock_threshold,
        allow_backorder: variant.allow_backorder,
        stock_status: variant.stock_status,
        position: variant.position,
        is_active: variant.is_active,
        custom_fields: (variant.custom_fields as Record<string, unknown>) ?? {},
      })) ?? [],
    attributes:
      attributes?.map((attribute) => ({
        id: attribute.id,
        group_name: attribute.group_name,
        attribute_key: attribute.attribute_key,
        attribute_value: attribute.attribute_value,
        sort_order: attribute.sort_order,
      })) ?? [],
    custom_fields: customFields,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}

export async function listFieldDefinitions(db: SupabaseClient, tenantId: string) {
  const { data } = await db
    .from("product_field_definitions")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("sort_order");

  return data ?? [];
}

export async function deleteProduct(
  db: SupabaseClient,
  tenantId: string,
  productId: string,
) {
  const { error } = await db
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("tenant_id", tenantId);

  if (error) {
    if (error.code === "23503") {
      throw new Error("Cannot delete: product is linked to orders or carts.");
    }
    throw new Error(error.message);
  }
}
