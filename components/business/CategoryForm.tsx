"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/ImageUpload";
import { CategoryIconPicker } from "@/components/business/CategoryIconPicker";
import type { Category } from "@/lib/types/ecommerce";
import {
  AdminFormActions,
  AdminFormField,
  AdminFormGrid,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/admin-ui";

type CategoryFormProps = {
  mode: "create" | "edit";
  tenantSlug: string;
  tenantId: string;
  categories: Pick<Category, "id" | "name">[];
  initial?: Partial<Category>;
};

export function CategoryForm({
  mode,
  tenantSlug,
  tenantId,
  categories,
  initial,
}: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [parentCategoryId, setParentCategoryId] = useState(
    initial?.parent_category_id ?? "",
  );
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [iconName, setIconName] = useState(initial?.icon_name ?? "LayoutGrid");
  const [productCountText, setProductCountText] = useState(
    initial?.product_count_text ?? "",
  );
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parentOptions = categories.filter((category) => category.id !== initial?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      name,
      slug: slug || undefined,
      description: description || null,
      image_url: imageUrl || null,
      parent_category_id: parentCategoryId || null,
      sort_order: Number(sortOrder) || 0,
      icon_name: iconName || null,
      product_count_text: productCountText || null,
      is_active: isActive,
    };

    const endpoint =
      mode === "create"
        ? "/api/business/categories/create"
        : "/api/business/categories/update";

    const res = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_slug: tenantSlug,
        category_id: initial?.id,
        category: payload,
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(json.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    router.push(`/business/${tenantSlug}/categories?success=Category saved`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AdminFormGrid>
        <AdminFormField label="Category name" required>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={adminInputClass}
            placeholder="e.g. Electronics"
          />
        </AdminFormField>

        <AdminFormField label="Slug" hint="Auto-generated from name if left blank">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={adminInputClass}
            placeholder="electronics"
          />
        </AdminFormField>

        <AdminFormField label="Parent category">
          <select
            value={parentCategoryId}
            onChange={(e) => setParentCategoryId(e.target.value)}
            className={adminSelectClass}
          >
            <option value="">None (top level)</option>
            {parentOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </AdminFormField>

        <AdminFormField label="Sort order">
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={adminInputClass}
          />
        </AdminFormField>

        <AdminFormField
          label="Storefront icon"
          hint="Shown in the category strip on your storefront"
          span={2}
        >
          <CategoryIconPicker value={iconName} onChange={setIconName} />
        </AdminFormField>

        <AdminFormField label="Product count label">
          <input
            value={productCountText}
            onChange={(e) => setProductCountText(e.target.value)}
            placeholder="e.g. 1200+ Products"
            className={adminInputClass}
          />
        </AdminFormField>

        <AdminFormField label="Description" span={2}>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={adminTextareaClass}
            placeholder="Optional category description"
          />
        </AdminFormField>

        <AdminFormField label="Category image" span={2}>
          <ImageUpload folder="categories" onUpload={(url) => setImageUrl(url)} />
          {imageUrl ? (
            <p className="truncate text-xs text-gray-500">Current image: {imageUrl}</p>
          ) : null}
        </AdminFormField>
      </AdminFormGrid>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        Active (visible on storefront)
      </label>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </div>
      ) : null}

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
          {submitting ? "Saving…" : mode === "create" ? "Create category" : "Save changes"}
        </button>
      </AdminFormActions>

      <input type="hidden" name="tenant_id" value={tenantId} readOnly />
    </form>
  );
}
