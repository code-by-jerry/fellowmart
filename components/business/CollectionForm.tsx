"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/ImageUpload";
import type { Collection } from "@/lib/types/ecommerce";
import {
  AdminFormActions,
  AdminFormField,
  AdminFormGrid,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/admin-ui";

type CollectionFormProps = {
  mode: "create" | "edit";
  tenantSlug: string;
  initial?: Partial<Collection>;
};

export function CollectionForm({ mode, tenantSlug, initial }: CollectionFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      name,
      slug: slug || undefined,
      description: description || null,
      image_url: imageUrl || null,
      sort_order: Number(sortOrder) || 0,
      is_active: isActive,
    };

    const endpoint =
      mode === "create"
        ? "/api/business/collections/create"
        : "/api/business/collections/update";

    const res = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_slug: tenantSlug,
        collection_id: initial?.id,
        collection: payload,
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(json.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    router.push(`/business/${tenantSlug}/collections?success=Collection saved`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AdminFormGrid>
        <AdminFormField label="Collection name" required>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={adminInputClass}
            placeholder="e.g. Weekend Sale"
          />
        </AdminFormField>

        <AdminFormField label="Slug" hint="Auto-generated from name if left blank">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={adminInputClass}
            placeholder="weekend-sale"
          />
        </AdminFormField>

        <AdminFormField label="Sort order">
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={adminInputClass}
          />
        </AdminFormField>

        <AdminFormField label="Description" span={2}>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={adminTextareaClass}
            placeholder="Optional collection description"
          />
        </AdminFormField>

        <AdminFormField label="Collection image" span={2}>
          <ImageUpload folder="collections" onUpload={(url) => setImageUrl(url)} />
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
          {submitting ? "Saving…" : mode === "create" ? "Create collection" : "Save changes"}
        </button>
      </AdminFormActions>
    </form>
  );
}
