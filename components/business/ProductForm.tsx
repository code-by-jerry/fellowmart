"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Trash2, Wand2 } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import {
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
  AdminFormActions,
  AdminFormCard,
  AdminFormField,
  AdminFormGrid,
} from "@/components/admin/admin-ui";
import {
  generateBaseSku,
  generateVariantsFromOptions,
  slugifyProductName,
} from "@/lib/catalog/product-sku";
import {
  DEFAULT_PRODUCT_FORM,
  PRODUCT_FIELD_GROUPS,
  type CustomFieldType,
  type ProductFieldDefinition,
  type ProductFormInput,
} from "@/lib/types/product";
import { TagPicker, type TagOption } from "@/components/business/TagPicker";

type CategoryOption = { id: string; name: string };
type CollectionOption = { id: string; name: string };
type BrandOption = { id: string; name: string };

type ProductFormProps = {
  tenantSlug: string;
  categories: CategoryOption[];
  collections?: CollectionOption[];
  brands?: BrandOption[];
  tagSuggestions?: TagOption[];
  fieldDefinitions: ProductFieldDefinition[];
  initial?: ProductFormInput;
  productId?: string;
  mode: "create" | "edit";
};

const FIELD_TYPES: CustomFieldType[] = [
  "text",
  "textarea",
  "number",
  "boolean",
  "select",
  "multi_select",
  "url",
  "date",
  "color",
];

function Section({
  id,
  title,
  description,
  children,
  defaultOpen = false,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      id={id}
      open={defaultOpen}
      className="group rounded-md border border-gray-200 bg-white"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <div>
          <h3 className="text-[13px] font-semibold text-gray-900">{title}</h3>
          <p className="mt-0.5 text-[12px] text-gray-500">{description}</p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-gray-200 px-4 py-4">{children}</div>
    </details>
  );
}

export function ProductForm({
  tenantSlug,
  categories,
  collections = [],
  brands = [],
  tagSuggestions = [],
  fieldDefinitions,
  initial,
  productId,
  mode,
}: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormInput>({
    ...DEFAULT_PRODUCT_FORM,
    ...initial,
    options: initial?.options ?? [],
    variants: initial?.variants ?? [],
    attributes: initial?.attributes ?? [],
    images: initial?.images ?? [],
    tags: initial?.tags ?? [],
    collection_ids: initial?.collection_ids ?? [],
    meta_keywords: initial?.meta_keywords ?? [],
    custom_fields: initial?.custom_fields ?? {},
    new_field_definitions: [],
  });
  const [definitions, setDefinitions] = useState(fieldDefinitions);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [skuTouched, setSkuTouched] = useState(Boolean(initial?.sku));

  const productDefinitions = useMemo(
    () =>
      definitions.filter(
        (definition) =>
          definition.applies_to === "product" || definition.applies_to === "both",
      ),
    [definitions],
  );

  const update = <K extends keyof ProductFormInput>(key: K, value: ProductFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleNameChange = (name: string) => {
    update("name", name);
    if (!slugTouched) update("slug", slugifyProductName(name));
    if (!skuTouched) update("sku", generateBaseSku(tenantSlug, name));
  };

  const addOption = () => {
    update("options", [
      ...(form.options ?? []),
      { name: "", position: form.options?.length ?? 0, values: [{ value: "" }] },
    ]);
    update("has_variants", true);
  };

  const generateVariants = () => {
    const options = (form.options ?? [])
      .filter((option) => option.name.trim() && option.values.some((value) => value.value.trim()))
      .map((option) => ({
        name: option.name.trim(),
        values: option.values.map((value) => value.value.trim()).filter(Boolean),
      }));

    const generated = generateVariantsFromOptions(form.name, form.sku, options);
    const existing = form.variants ?? [];
    const attributesKey = (attributes: Record<string, string>) =>
      JSON.stringify(
        Object.entries(attributes).sort(([a], [b]) => a.localeCompare(b)),
      );
    const existingByAttributes = new Map(
      existing.map((variant) => [attributesKey(variant.attributes), variant]),
    );
    const existingBySku = new Map(existing.map((variant) => [variant.sku, variant]));

    update(
      "variants",
      generated.map((variant, index) => {
        const previous =
          existingByAttributes.get(attributesKey(variant.attributes)) ??
          existingBySku.get(variant.sku);

        return {
          ...variant,
          id: previous?.id,
          price: previous?.price ?? form.price ?? 0,
          compare_at_price: previous?.compare_at_price ?? form.compare_at_price ?? null,
          cost_price: previous?.cost_price ?? form.cost_price ?? null,
          stock_quantity: previous?.stock_quantity ?? 0,
          barcode: previous?.barcode ?? null,
          image_url: previous?.image_url ?? null,
          low_stock_threshold: previous?.low_stock_threshold,
          allow_backorder: previous?.allow_backorder,
          position: index,
          is_active: previous?.is_active ?? true,
        };
      }),
    );
    update("has_variants", true);
  };

  const addAttribute = () => {
    update("attributes", [
      ...(form.attributes ?? []),
      { attribute_key: "", attribute_value: "", group_name: "Specifications" },
    ]);
  };

  const addCustomDefinition = () => {
    const key = `custom_${Date.now()}`;
    const definition: ProductFieldDefinition = {
      field_key: key,
      label: "New custom field",
      field_type: "text",
      field_group: "Custom",
      applies_to: "product",
      options: [],
      is_required: false,
    };
    setDefinitions((current) => [...current, definition]);
    update("new_field_definitions", [...(form.new_field_definitions ?? []), definition]);
  };

  const toggleCollection = (collectionId: string) => {
    const current = form.collection_ids ?? [];
    const next = current.includes(collectionId)
      ? current.filter((id) => id !== collectionId)
      : [...current, collectionId];
    update("collection_ids", next);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const endpoint =
      mode === "edit" && productId
        ? "/api/business/products/update"
        : "/api/business/products/create";

    const payload =
      mode === "edit" && productId
        ? { tenant_slug: tenantSlug, product_id: productId, product: form }
        : { tenant_slug: tenantSlug, product: form };

    const response = await fetch(endpoint, {
      method: mode === "edit" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(result.error ?? "Could not save product.");
      setSubmitting(false);
      return;
    }

    router.push(`/business/${tenantSlug}/products?success=Product saved`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-md border border-gray-200 bg-[#fafafa] px-4 py-3 text-[13px] text-gray-700">
        <p className="font-medium text-gray-900">Enterprise product structure</p>
        <p className="mt-1">
          Fields are grouped into {Object.keys(PRODUCT_FIELD_GROUPS).length} sections:
          basic info, identification & SKU, pricing, inventory, shipping, media, SEO,
          variant options, variant SKUs, specifications, and custom fields.
        </p>
      </div>

      <Section
        id={PRODUCT_FIELD_GROUPS.basic.id}
        title={PRODUCT_FIELD_GROUPS.basic.label}
        description={PRODUCT_FIELD_GROUPS.basic.description}
        defaultOpen
      >
        <AdminFormGrid>
          <AdminFormField label="Product name" required>
            <input
              required
              className={adminInputClass}
              value={form.name}
              onChange={(event) => handleNameChange(event.target.value)}
            />
          </AdminFormField>
          <AdminFormField label="URL slug" required>
            <input
              required
              className={adminInputClass}
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                update("slug", slugifyProductName(event.target.value));
              }}
            />
          </AdminFormField>
          <AdminFormField
            label="Brand"
            hint={
              brands.length === 0
                ? "Add brands under Brands in the sidebar first."
                : undefined
            }
          >
            <select
              className={adminSelectClass}
              value={form.brand_id ?? ""}
              onChange={(event) => {
                const brandId = event.target.value || null;
                const selected = brands.find((brand) => brand.id === brandId);
                setForm((current) => ({
                  ...current,
                  brand_id: brandId,
                  brand: selected?.name ?? "",
                }));
              }}
            >
              <option value="">No brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-gray-400">
              Manage brands in{" "}
              <Link
                href={`/business/${tenantSlug}/brands`}
                className="font-medium text-primary hover:underline"
              >
                Brands
              </Link>
              .
            </p>
          </AdminFormField>
          <AdminFormField label="Subtitle">
            <input
              className={adminInputClass}
              value={form.subtitle ?? ""}
              onChange={(event) => update("subtitle", event.target.value)}
              placeholder="Short tagline under product title"
            />
          </AdminFormField>
          <AdminFormField label="Category">
            <select
              className={adminSelectClass}
              value={form.category_id ?? ""}
              onChange={(event) => update("category_id", event.target.value || null)}
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField label="Collections" span={2}>
            {collections.length === 0 ? (
              <p className="text-sm text-gray-500">
                No collections yet.{" "}
                <Link
                  href={`/business/${tenantSlug}/collections/new`}
                  className="font-medium text-primary hover:underline"
                >
                  Create a collection
                </Link>
              </p>
            ) : (
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {collections.map((collection) => (
                  <label
                    key={collection.id}
                    className="inline-flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={(form.collection_ids ?? []).includes(collection.id)}
                      onChange={() => toggleCollection(collection.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    {collection.name}
                  </label>
                ))}
              </div>
            )}
          </AdminFormField>
          <AdminFormField label="Status">
            <select
              className={adminSelectClass}
              value={form.status ?? "draft"}
              onChange={(event) =>
                update("status", event.target.value as ProductFormInput["status"])
              }
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </AdminFormField>
          <AdminFormField label="Tags" span={2}>
            <TagPicker
              tenantSlug={tenantSlug}
              value={form.tags ?? []}
              suggestions={tagSuggestions}
              onChange={(tags) => update("tags", tags)}
            />
          </AdminFormField>
          <AdminFormField label="Short description" span={2}>
            <textarea
              rows={3}
              className={adminTextareaClass}
              value={form.description ?? ""}
              onChange={(event) => update("description", event.target.value)}
            />
          </AdminFormField>
          <AdminFormField label="Long description" span={2}>
            <textarea
              rows={5}
              className={adminTextareaClass}
              value={form.long_description ?? ""}
              onChange={(event) => update("long_description", event.target.value)}
            />
          </AdminFormField>
          <AdminFormField label="Featured product">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_featured ?? false}
                onChange={(event) => update("is_featured", event.target.checked)}
              />
              Show on homepage featured section
            </label>
          </AdminFormField>
          <AdminFormField label="Publish">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active ?? false}
                onChange={(event) => update("is_active", event.target.checked)}
              />
              Visible on storefront when status is active
            </label>
          </AdminFormField>
        </AdminFormGrid>
      </Section>

      <Section
        id={PRODUCT_FIELD_GROUPS.identification.id}
        title={PRODUCT_FIELD_GROUPS.identification.label}
        description={PRODUCT_FIELD_GROUPS.identification.description}
        defaultOpen
      >
        <AdminFormGrid>
          <AdminFormField label="Base SKU" required>
            <div className="flex gap-2">
              <input
                required
                className={adminInputClass}
                value={form.sku}
                onChange={(event) => {
                  setSkuTouched(true);
                  update("sku", event.target.value.toUpperCase());
                }}
                placeholder="FM-MOB-015"
              />
              <button
                type="button"
                onClick={() => update("sku", generateBaseSku(tenantSlug, form.name))}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-gray-300 px-2.5 text-[13px] text-gray-600 hover:bg-gray-50"
              >
                <Wand2 size={14} />
                Generate
              </button>
            </div>
          </AdminFormField>
          <AdminFormField label="Barcode (UPC/EAN)">
            <input
              className={adminInputClass}
              value={form.barcode ?? ""}
              onChange={(event) => update("barcode", event.target.value)}
            />
          </AdminFormField>
          <AdminFormField label="MPN">
            <input
              className={adminInputClass}
              value={form.mpn ?? ""}
              onChange={(event) => update("mpn", event.target.value)}
            />
          </AdminFormField>
          <AdminFormField label="GTIN">
            <input
              className={adminInputClass}
              value={form.gtin ?? ""}
              onChange={(event) => update("gtin", event.target.value)}
            />
          </AdminFormField>
          <AdminFormField label="HS code">
            <input
              className={adminInputClass}
              value={form.hs_code ?? ""}
              onChange={(event) => update("hs_code", event.target.value)}
            />
          </AdminFormField>
          <AdminFormField label="Product type">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.has_variants ?? false}
                onChange={(event) => update("has_variants", event.target.checked)}
              />
              This product has variants (Color, Size, Storage, …)
            </label>
          </AdminFormField>
        </AdminFormGrid>
      </Section>

      {!form.has_variants ? (
        <>
          <Section
            id={PRODUCT_FIELD_GROUPS.pricing.id}
            title={PRODUCT_FIELD_GROUPS.pricing.label}
            description={PRODUCT_FIELD_GROUPS.pricing.description}
          >
            <AdminFormGrid>
              <AdminFormField label="Selling price" required>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className={adminInputClass}
                  value={form.price ?? 0}
                  onChange={(event) => update("price", Number(event.target.value))}
                />
              </AdminFormField>
              <AdminFormField label="Compare at price (MRP)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={adminInputClass}
                  value={form.compare_at_price ?? ""}
                  onChange={(event) =>
                    update(
                      "compare_at_price",
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                />
              </AdminFormField>
              <AdminFormField label="Cost price">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={adminInputClass}
                  value={form.cost_price ?? ""}
                  onChange={(event) =>
                    update("cost_price", event.target.value ? Number(event.target.value) : null)
                  }
                />
              </AdminFormField>
              <AdminFormField label="Tax class">
                <select
                  className={adminSelectClass}
                  value={form.tax_class ?? "standard"}
                  onChange={(event) => update("tax_class", event.target.value)}
                >
                  <option value="standard">Standard</option>
                  <option value="reduced">Reduced</option>
                  <option value="zero">Zero rated</option>
                  <option value="exempt">Exempt</option>
                </select>
              </AdminFormField>
              <AdminFormField label="Taxable">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.taxable ?? true}
                    onChange={(event) => update("taxable", event.target.checked)}
                  />
                  Charge tax on this product
                </label>
              </AdminFormField>
            </AdminFormGrid>
          </Section>

          <Section
            id={PRODUCT_FIELD_GROUPS.inventory.id}
            title={PRODUCT_FIELD_GROUPS.inventory.label}
            description={PRODUCT_FIELD_GROUPS.inventory.description}
          >
            <AdminFormGrid>
              <AdminFormField label="Track inventory">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.track_inventory ?? true}
                    onChange={(event) => update("track_inventory", event.target.checked)}
                  />
                  Track stock quantity
                </label>
              </AdminFormField>
              <AdminFormField label="Stock quantity">
                <input
                  type="number"
                  min="0"
                  className={adminInputClass}
                  value={form.stock_quantity ?? 0}
                  onChange={(event) => update("stock_quantity", Number(event.target.value))}
                />
              </AdminFormField>
              <AdminFormField label="Low stock threshold">
                <input
                  type="number"
                  min="0"
                  className={adminInputClass}
                  value={form.low_stock_threshold ?? 5}
                  onChange={(event) =>
                    update("low_stock_threshold", Number(event.target.value))
                  }
                />
              </AdminFormField>
              <AdminFormField label="Allow backorders">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.allow_backorder ?? false}
                    onChange={(event) => update("allow_backorder", event.target.checked)}
                  />
                  Sell when out of stock
                </label>
              </AdminFormField>
            </AdminFormGrid>
          </Section>
        </>
      ) : null}

      <Section
        id={PRODUCT_FIELD_GROUPS.shipping.id}
        title={PRODUCT_FIELD_GROUPS.shipping.label}
        description={PRODUCT_FIELD_GROUPS.shipping.description}
      >
        <AdminFormGrid>
          <AdminFormField label="Weight">
            <input
              type="number"
              min="0"
              step="0.001"
              className={adminInputClass}
              value={form.weight ?? ""}
              onChange={(event) =>
                update("weight", event.target.value ? Number(event.target.value) : null)
              }
            />
          </AdminFormField>
          <AdminFormField label="Weight unit">
            <select
              className={adminSelectClass}
              value={form.weight_unit ?? "kg"}
              onChange={(event) => update("weight_unit", event.target.value)}
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="lb">lb</option>
            </select>
          </AdminFormField>
          <AdminFormField label="Length">
            <input
              type="number"
              min="0"
              step="0.01"
              className={adminInputClass}
              value={form.length ?? ""}
              onChange={(event) =>
                update("length", event.target.value ? Number(event.target.value) : null)
              }
            />
          </AdminFormField>
          <AdminFormField label="Width">
            <input
              type="number"
              min="0"
              step="0.01"
              className={adminInputClass}
              value={form.width ?? ""}
              onChange={(event) =>
                update("width", event.target.value ? Number(event.target.value) : null)
              }
            />
          </AdminFormField>
          <AdminFormField label="Height">
            <input
              type="number"
              min="0"
              step="0.01"
              className={adminInputClass}
              value={form.height ?? ""}
              onChange={(event) =>
                update("height", event.target.value ? Number(event.target.value) : null)
              }
            />
          </AdminFormField>
          <AdminFormField label="Dimension unit">
            <select
              className={adminSelectClass}
              value={form.dimension_unit ?? "cm"}
              onChange={(event) => update("dimension_unit", event.target.value)}
            >
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
          </AdminFormField>
          <AdminFormField label="Requires shipping">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.requires_shipping ?? true}
                onChange={(event) => update("requires_shipping", event.target.checked)}
              />
              Physical product requires shipping
            </label>
          </AdminFormField>
          <AdminFormField label="Shipping class">
            <input
              className={adminInputClass}
              value={form.shipping_class ?? ""}
              onChange={(event) => update("shipping_class", event.target.value)}
              placeholder="standard, heavy, fragile"
            />
          </AdminFormField>
        </AdminFormGrid>
      </Section>

      <Section
        id={PRODUCT_FIELD_GROUPS.media.id}
        title={PRODUCT_FIELD_GROUPS.media.label}
        description={PRODUCT_FIELD_GROUPS.media.description}
      >
        <AdminFormGrid>
          <AdminFormField label="Featured image URL" span={2}>
            <input
              className={adminInputClass}
              value={form.featured_image_url ?? ""}
              onChange={(event) => update("featured_image_url", event.target.value)}
              placeholder="https://..."
            />
          </AdminFormField>
          <AdminFormField label="Upload featured image" span={2}>
            <ImageUpload
              folder={`products/${tenantSlug}`}
              onUpload={(url) => update("featured_image_url", url)}
            />
          </AdminFormField>
        </AdminFormGrid>
      </Section>

      <Section
        id={PRODUCT_FIELD_GROUPS.seo.id}
        title={PRODUCT_FIELD_GROUPS.seo.label}
        description={PRODUCT_FIELD_GROUPS.seo.description}
      >
        <AdminFormGrid>
          <AdminFormField label="SEO title" span={2}>
            <input
              className={adminInputClass}
              value={form.seo_title ?? ""}
              onChange={(event) => update("seo_title", event.target.value)}
            />
          </AdminFormField>
          <AdminFormField label="SEO description" span={2}>
            <textarea
              rows={3}
              className={adminTextareaClass}
              value={form.seo_description ?? ""}
              onChange={(event) => update("seo_description", event.target.value)}
            />
          </AdminFormField>
          <AdminFormField label="Meta keywords" span={2}>
            <input
              className={adminInputClass}
              value={(form.meta_keywords ?? []).join(", ")}
              onChange={(event) =>
                update(
                  "meta_keywords",
                  event.target.value
                    .split(",")
                    .map((keyword) => keyword.trim())
                    .filter(Boolean),
                )
              }
            />
          </AdminFormField>
        </AdminFormGrid>
      </Section>

      {form.has_variants ? (
        <>
          <Section
            id={PRODUCT_FIELD_GROUPS.options.id}
            title={PRODUCT_FIELD_GROUPS.options.label}
            description={PRODUCT_FIELD_GROUPS.options.description}
          >
            <div className="space-y-4">
              {(form.options ?? []).map((option, optionIndex) => (
                <div key={optionIndex} className="rounded-md border border-gray-200 p-3">
                  <div className="mb-3 flex items-center gap-3">
                    <input
                      className={adminInputClass}
                      value={option.name}
                      placeholder="Option name (e.g. Color)"
                      onChange={(event) => {
                        const options = [...(form.options ?? [])];
                        options[optionIndex] = { ...option, name: event.target.value };
                        update("options", options);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          "options",
                          (form.options ?? []).filter((_, index) => index !== optionIndex),
                        )
                      }
                      className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {option.values.map((value, valueIndex) => (
                      <div key={valueIndex} className="flex gap-2">
                        <input
                          className={adminInputClass}
                          value={value.value}
                          placeholder="Value (e.g. Midnight Black)"
                          onChange={(event) => {
                            const options = [...(form.options ?? [])];
                            const values = [...option.values];
                            values[valueIndex] = { ...value, value: event.target.value };
                            options[optionIndex] = { ...option, values };
                            update("options", options);
                          }}
                        />
                        <input
                          className={`${adminInputClass} max-w-[120px]`}
                          value={value.swatch_color ?? ""}
                          placeholder="#000000"
                          onChange={(event) => {
                            const options = [...(form.options ?? [])];
                            const values = [...option.values];
                            values[valueIndex] = {
                              ...value,
                              swatch_color: event.target.value,
                            };
                            options[optionIndex] = { ...option, values };
                            update("options", options);
                          }}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const options = [...(form.options ?? [])];
                        options[optionIndex] = {
                          ...option,
                          values: [...option.values, { value: "" }],
                        };
                        update("options", options);
                      }}
                      className="text-sm font-medium text-primary"
                    >
                      + Add value
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-300 px-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Plus size={16} />
                  Add option
                </button>
                <button
                  type="button"
                  onClick={generateVariants}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-gray-900 px-3 text-[13px] font-medium text-white hover:bg-gray-800"
                >
                  <Wand2 size={16} />
                  Generate variant SKUs
                </button>
              </div>
            </div>
          </Section>

          <Section
            id={PRODUCT_FIELD_GROUPS.variants.id}
            title={PRODUCT_FIELD_GROUPS.variants.label}
            description={PRODUCT_FIELD_GROUPS.variants.description}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-2 py-2">Image</th>
                    <th className="px-2 py-2">Variant</th>
                    <th className="px-2 py-2">SKU</th>
                    <th className="px-2 py-2">Price</th>
                    <th className="px-2 py-2">Compare</th>
                    <th className="px-2 py-2">Stock</th>
                    <th className="px-2 py-2">Barcode</th>
                  </tr>
                </thead>
                <tbody>
                  {(form.variants ?? []).map((variant, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-2 py-3 align-top">
                        <div className="flex flex-col gap-2">
                          <ImageUpload
                            compact
                            folder={`products/${tenantSlug}/variants`}
                            currentUrl={variant.image_url ?? undefined}
                            onUpload={(url) => {
                              const variants = [...(form.variants ?? [])];
                              variants[index] = {
                                ...variant,
                                image_url: url || null,
                              };
                              update("variants", variants);
                            }}
                          />
                          <input
                            className={`${adminInputClass} min-w-[120px] text-xs`}
                            value={variant.image_url ?? ""}
                            placeholder="Image URL"
                            onChange={(event) => {
                              const variants = [...(form.variants ?? [])];
                              variants[index] = {
                                ...variant,
                                image_url: event.target.value || null,
                              };
                              update("variants", variants);
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <input
                          className={adminInputClass}
                          value={variant.name}
                          onChange={(event) => {
                            const variants = [...(form.variants ?? [])];
                            variants[index] = { ...variant, name: event.target.value };
                            update("variants", variants);
                          }}
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          {Object.entries(variant.attributes)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(" · ")}
                        </p>
                      </td>
                      <td className="px-2 py-3">
                        <input
                          className={adminInputClass}
                          value={variant.sku}
                          onChange={(event) => {
                            const variants = [...(form.variants ?? [])];
                            variants[index] = {
                              ...variant,
                              sku: event.target.value.toUpperCase(),
                            };
                            update("variants", variants);
                          }}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={adminInputClass}
                          value={variant.price ?? 0}
                          onChange={(event) => {
                            const variants = [...(form.variants ?? [])];
                            variants[index] = {
                              ...variant,
                              price: Number(event.target.value),
                            };
                            update("variants", variants);
                          }}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={adminInputClass}
                          value={variant.compare_at_price ?? ""}
                          onChange={(event) => {
                            const variants = [...(form.variants ?? [])];
                            variants[index] = {
                              ...variant,
                              compare_at_price: event.target.value
                                ? Number(event.target.value)
                                : null,
                            };
                            update("variants", variants);
                          }}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          type="number"
                          min="0"
                          className={adminInputClass}
                          value={variant.stock_quantity ?? 0}
                          onChange={(event) => {
                            const variants = [...(form.variants ?? [])];
                            variants[index] = {
                              ...variant,
                              stock_quantity: Number(event.target.value),
                            };
                            update("variants", variants);
                          }}
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          className={adminInputClass}
                          value={variant.barcode ?? ""}
                          onChange={(event) => {
                            const variants = [...(form.variants ?? [])];
                            variants[index] = { ...variant, barcode: event.target.value };
                            update("variants", variants);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(form.variants ?? []).length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                  Add options above, then click Generate variant SKUs.
                </p>
              ) : null}
            </div>
          </Section>
        </>
      ) : null}

      <Section
        id={PRODUCT_FIELD_GROUPS.specifications.id}
        title={PRODUCT_FIELD_GROUPS.specifications.label}
        description={PRODUCT_FIELD_GROUPS.specifications.description}
      >
        <div className="space-y-3">
          {(form.attributes ?? []).map((attribute, index) => (
            <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                className={adminInputClass}
                value={attribute.attribute_key}
                placeholder="Attribute (e.g. Display)"
                onChange={(event) => {
                  const attributes = [...(form.attributes ?? [])];
                  attributes[index] = { ...attribute, attribute_key: event.target.value };
                  update("attributes", attributes);
                }}
              />
              <input
                className={adminInputClass}
                value={attribute.attribute_value}
                placeholder="Value (e.g. 6.1-inch OLED)"
                onChange={(event) => {
                  const attributes = [...(form.attributes ?? [])];
                  attributes[index] = { ...attribute, attribute_value: event.target.value };
                  update("attributes", attributes);
                }}
              />
              <button
                type="button"
                onClick={() =>
                  update(
                    "attributes",
                    (form.attributes ?? []).filter((_, rowIndex) => rowIndex !== index),
                  )
                }
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addAttribute}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            <Plus size={16} />
            Add specification
          </button>
        </div>
      </Section>

      <Section
        id={PRODUCT_FIELD_GROUPS.custom.id}
        title={PRODUCT_FIELD_GROUPS.custom.label}
        description={PRODUCT_FIELD_GROUPS.custom.description}
      >
        <div className="space-y-4">
          {productDefinitions.map((definition) => (
            <AdminFormField key={definition.field_key} label={definition.label}>
              {definition.field_type === "boolean" ? (
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={Boolean(form.custom_fields?.[definition.field_key])}
                    onChange={(event) =>
                      update("custom_fields", {
                        ...(form.custom_fields ?? {}),
                        [definition.field_key]: event.target.checked,
                      })
                    }
                  />
                  Yes
                </label>
              ) : definition.field_type === "textarea" ? (
                <textarea
                  rows={3}
                  className={adminTextareaClass}
                  value={String(form.custom_fields?.[definition.field_key] ?? "")}
                  onChange={(event) =>
                    update("custom_fields", {
                      ...(form.custom_fields ?? {}),
                      [definition.field_key]: event.target.value,
                    })
                  }
                />
              ) : (
                <input
                  className={adminInputClass}
                  type={definition.field_type === "number" ? "number" : "text"}
                  value={String(form.custom_fields?.[definition.field_key] ?? "")}
                  onChange={(event) =>
                    update("custom_fields", {
                      ...(form.custom_fields ?? {}),
                      [definition.field_key]:
                        definition.field_type === "number"
                          ? Number(event.target.value)
                          : event.target.value,
                    })
                  }
                />
              )}
            </AdminFormField>
          ))}

          <div className="rounded-md border border-dashed border-gray-300 p-3">
            <p className="text-sm font-medium text-gray-900">Add a new custom field</p>
            <p className="mt-1 text-xs text-gray-500">
              Custom fields are saved at tenant level and reusable across products.
            </p>
            <button
              type="button"
              onClick={addCustomDefinition}
              className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-300 px-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus size={16} />
              New custom field
            </button>
          </div>
        </div>
      </Section>

      <AdminFormCard>
        <AdminFormActions>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-8 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-[13px] font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-8 items-center justify-center rounded-md bg-gray-900 px-3 text-[13px] font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {submitting ? "Saving…" : mode === "edit" ? "Update product" : "Create product"}
          </button>
        </AdminFormActions>
      </AdminFormCard>
    </form>
  );
}
