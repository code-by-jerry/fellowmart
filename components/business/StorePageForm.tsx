"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminFormActions,
  AdminFormField,
  AdminFormGrid,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/admin-ui";
import type {
  StorePageFooterGroup,
  StorePageRecord,
} from "@/lib/catalog/store-page-service";

type StorePageFormProps = {
  mode: "create" | "edit";
  tenantSlug: string;
  initial?: Partial<StorePageRecord>;
};

export function StorePageForm({ mode, tenantSlug, initial }: StorePageFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initial?.meta_description ?? "",
  );
  const [footerGroup, setFooterGroup] = useState<StorePageFooterGroup>(
    initial?.footer_group ?? "company",
  );
  const [showInFooter, setShowInFooter] = useState(
    initial?.show_in_footer ?? true,
  );
  const [status, setStatus] = useState<"draft" | "published">(
    initial?.status === "published" ? "published" : "draft",
  );
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      title,
      slug: slug || undefined,
      body: body || "",
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      footer_group: footerGroup,
      show_in_footer: footerGroup === "none" ? false : showInFooter,
      status,
      is_active: isActive,
      sort_order: Number(sortOrder) || 0,
    };

    const endpoint =
      mode === "create"
        ? "/api/business/pages/create"
        : "/api/business/pages/update";

    const res = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_slug: tenantSlug,
        page_id: initial?.id,
        page: payload,
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(json.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    router.push(`/business/${tenantSlug}/pages?success=Page saved`);
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
            placeholder="e.g. Privacy Policy"
          />
        </AdminFormField>

        <AdminFormField
          label="URL slug"
          hint="Live at /store/{tenant}/pages/your-slug"
        >
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={adminInputClass}
            placeholder="privacy-policy"
          />
        </AdminFormField>

        <AdminFormField label="Status">
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value === "published" ? "published" : "draft")
            }
            className={adminSelectClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
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
          label="Footer column"
          hint="Where this page appears in the storefront footer"
        >
          <select
            value={footerGroup}
            onChange={(e) =>
              setFooterGroup(e.target.value as StorePageFooterGroup)
            }
            className={adminSelectClass}
          >
            <option value="company">Company</option>
            <option value="help">Help</option>
            <option value="none">Don’t show in footer</option>
          </select>
        </AdminFormField>

        {footerGroup !== "none" ? (
          <AdminFormField label="Footer visibility">
            <label className="flex h-9 items-center gap-2 text-[13px] text-gray-700">
              <input
                type="checkbox"
                checked={showInFooter}
                onChange={(e) => setShowInFooter(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Show in footer when published
            </label>
          </AdminFormField>
        ) : null}

        <AdminFormField
          label="Page content"
          hint="Paragraphs separated by a blank line. Supports ## headings, **bold**, *italic*, [links](url)."
          span={2}
          required
        >
          <textarea
            required
            rows={16}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={adminTextareaClass}
            placeholder={
              "Write your page content here.\n\n## Section title\n\nAnother paragraph…"
            }
          />
        </AdminFormField>
      </AdminFormGrid>

      <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
        <p className="text-[13px] font-medium text-gray-900">SEO</p>
        <p className="mt-0.5 text-[12px] text-gray-500">
          Optional. Defaults use the page title.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <AdminFormField label="Meta title">
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className={adminInputClass}
              placeholder="Defaults to page title"
            />
          </AdminFormField>
          <AdminFormField label="Meta description">
            <input
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className={adminInputClass}
              placeholder="Short summary for search results"
            />
          </AdminFormField>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        Active (visible when published)
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
              ? "Create page"
              : "Save changes"}
        </button>
      </AdminFormActions>
    </form>
  );
}
