"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ui/ImageUpload";
import {
  AdminFormActions,
  AdminFormField,
  AdminFormGrid,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/admin-ui";
import type { HeroBannerRecord } from "@/lib/catalog/hero-banner-service";

export type BannerProductOption = {
  id: string;
  name: string;
  slug: string;
  status?: string | null;
  is_active?: boolean | null;
};

type HeroBannerFormProps = {
  mode: "create" | "edit";
  tenantSlug: string;
  products: BannerProductOption[];
  initial?: Partial<HeroBannerRecord>;
};

export function HeroBannerForm({
  mode,
  tenantSlug,
  products,
  initial,
}: HeroBannerFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [ctaLabel, setCtaLabel] = useState(initial?.cta_label ?? "Shop Now");
  const [desktopImageUrl, setDesktopImageUrl] = useState(
    initial?.desktop_image_url ?? "",
  );
  const [mobileImageUrl, setMobileImageUrl] = useState(
    initial?.mobile_image_url ?? "",
  );
  const [productId, setProductId] = useState(initial?.product_id ?? "");
  const [linkUrl, setLinkUrl] = useState(initial?.link_url ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!desktopImageUrl.trim()) {
      setError("Desktop banner image is required.");
      setSubmitting(false);
      return;
    }

    const payload = {
      title,
      eyebrow: eyebrow || null,
      description: description || null,
      cta_label: ctaLabel || "Shop Now",
      desktop_image_url: desktopImageUrl,
      mobile_image_url: mobileImageUrl || null,
      product_id: productId || null,
      link_url: productId ? null : linkUrl || null,
      sort_order: Number(sortOrder) || 0,
      is_active: isActive,
    };

    const endpoint =
      mode === "create"
        ? "/api/business/banners/create"
        : "/api/business/banners/update";

    const res = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_slug: tenantSlug,
        banner_id: initial?.id,
        banner: payload,
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(json.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    router.push(`/business/${tenantSlug}/banners?success=Banner saved`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AdminFormGrid>
        <AdminFormField label="Title" required>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={adminInputClass}
            placeholder="e.g. Welcome to Fellowmart"
          />
        </AdminFormField>

        <AdminFormField label="Eyebrow / subtitle">
          <input
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value)}
            className={adminInputClass}
            placeholder="FANTASTIC DEALS AND COLLECTIONS"
          />
        </AdminFormField>

        <AdminFormField label="Description" span={2}>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={adminTextareaClass}
            placeholder="Short supporting line under the title"
          />
        </AdminFormField>

        <AdminFormField label="CTA button label">
          <input
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            className={adminInputClass}
            placeholder="Shop Now"
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

        <AdminFormField
          label="Linked product (PDP)"
          hint="Clicking the banner opens this product page"
          span={2}
        >
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className={adminSelectClass}
          >
            <option value="">No product — use custom link or categories</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
                {product.is_active === false || product.status === "archived"
                  ? " (inactive)"
                  : ""}
              </option>
            ))}
          </select>
        </AdminFormField>

        {!productId ? (
          <AdminFormField
            label="Custom link URL"
            hint="Optional. Used when no product is linked. Leave blank to open Categories."
            span={2}
          >
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className={adminInputClass}
              placeholder="/store/your-store/categories or https://…"
            />
          </AdminFormField>
        ) : null}

        <AdminFormField
          label="Desktop / web banner image"
          hint="Wide hero image for desktop and tablet"
          span={2}
          required
        >
          <ImageUpload
            label="Desktop image"
            folder={`stores/${tenantSlug}/banners`}
            currentUrl={desktopImageUrl || undefined}
            onUpload={setDesktopImageUrl}
          />
        </AdminFormField>

        <AdminFormField
          label="Mobile banner image"
          hint="Optional. Shown on small screens; falls back to desktop image if empty."
          span={2}
        >
          <ImageUpload
            label="Mobile image"
            folder={`stores/${tenantSlug}/banners`}
            currentUrl={mobileImageUrl || undefined}
            onUpload={setMobileImageUrl}
          />
          {mobileImageUrl ? (
            <button
              type="button"
              className="mt-2 text-[12px] text-gray-500 underline hover:text-gray-800"
              onClick={() => setMobileImageUrl("")}
            >
              Remove mobile image
            </button>
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
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Create banner"
              : "Save changes"}
        </button>
      </AdminFormActions>
    </form>
  );
}
