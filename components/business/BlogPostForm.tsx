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
import type { BlogPostRecord } from "@/lib/catalog/blog-service";

type BlogPostFormProps = {
  mode: "create" | "edit";
  tenantSlug: string;
  initial?: Partial<BlogPostRecord>;
};

export function BlogPostForm({ mode, tenantSlug, initial }: BlogPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    initial?.cover_image_url ?? "",
  );
  const [authorName, setAuthorName] = useState(initial?.author_name ?? "");
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initial?.meta_description ?? "",
  );
  const [metaKeywords, setMetaKeywords] = useState(
    initial?.meta_keywords ?? "",
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
      excerpt: excerpt || null,
      body: body || "",
      cover_image_url: coverImageUrl || null,
      author_name: authorName || null,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      meta_keywords: metaKeywords || null,
      status,
      is_active: isActive,
      sort_order: Number(sortOrder) || 0,
      published_at: initial?.published_at ?? null,
    };

    const endpoint =
      mode === "create"
        ? "/api/business/blog/create"
        : "/api/business/blog/update";

    const res = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_slug: tenantSlug,
        post_id: initial?.id,
        post: payload,
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(json.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    router.push(`/business/${tenantSlug}/blog?success=Post saved`);
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
            placeholder="e.g. How to style your living room"
          />
        </AdminFormField>

        <AdminFormField label="Slug" hint="Auto-generated from title if left blank">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={adminInputClass}
            placeholder="how-to-style-your-living-room"
          />
        </AdminFormField>

        <AdminFormField label="Author">
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className={adminInputClass}
            placeholder="Store team"
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
          label="Excerpt"
          hint="Short summary shown on the blog listing and search results"
          span={2}
        >
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className={adminTextareaClass}
            placeholder="1–2 sentences for cards and SEO"
          />
        </AdminFormField>

        <AdminFormField
          label="Body"
          hint="Supports paragraphs, ## headings, **bold**, *italic*, and [links](https://…)"
          span={2}
          required
        >
          <textarea
            required
            rows={14}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={adminTextareaClass}
            placeholder={"## Introduction\n\nWrite your article here…"}
          />
        </AdminFormField>

        <AdminFormField label="Cover image" span={2}>
          <ImageUpload
            label="Cover image"
            folder={`stores/${tenantSlug}/blog`}
            currentUrl={coverImageUrl || undefined}
            onUpload={setCoverImageUrl}
          />
        </AdminFormField>
      </AdminFormGrid>

      <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
        <p className="text-[13px] font-medium text-gray-900">SEO</p>
        <p className="mt-0.5 text-[12px] text-gray-500">
          Optional overrides. Defaults use the post title and excerpt.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <AdminFormField label="Meta title">
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className={adminInputClass}
              placeholder="Defaults to post title"
            />
          </AdminFormField>
          <AdminFormField label="Meta keywords">
            <input
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              className={adminInputClass}
              placeholder="home, decor, tips"
            />
          </AdminFormField>
          <AdminFormField label="Meta description" span={2}>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className={adminTextareaClass}
              placeholder="Defaults to excerpt"
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
              ? "Create post"
              : "Save changes"}
        </button>
      </AdminFormActions>
    </form>
  );
}
