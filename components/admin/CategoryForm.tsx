'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ui/ImageUpload'
import { CategoryIconPicker } from '@/components/business/CategoryIconPicker'
import type { Category } from '@/lib/types/ecommerce'
import {
  AdminFormActions,
  AdminFormField,
  AdminFormGrid,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
} from '@/components/admin/admin-ui'

type TenantOption = { id: string; name: string; slug: string }

type CategoryFormProps = {
  mode: 'create' | 'edit'
  tenants: TenantOption[]
  categories: Pick<Category, 'id' | 'name'>[]
  initial?: Partial<Category> & { tenant_id?: string }
  defaultTenantId?: string
  defaultTenantSlug?: string
}

export function CategoryForm({
  mode,
  tenants,
  categories,
  initial,
  defaultTenantId,
  defaultTenantSlug,
}: CategoryFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [iconName, setIconName] = useState(initial?.icon_name ?? 'LayoutGrid')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const action =
    mode === 'create' ? '/api/admin/categories/create' : '/api/admin/categories/update'

  const parentOptions = categories.filter((category) => category.id !== initial?.id)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('image_url', imageUrl)
    formData.set('icon_name', iconName)

    const res = await fetch(action, {
      method: 'POST',
      body: formData,
    })

    if (res.redirected) {
      router.push(new URL(res.url).pathname + new URL(res.url).search)
      return
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? 'Something went wrong')
      setSubmitting(false)
      return
    }

    router.push(
      defaultTenantSlug
        ? `/admin/dashboard/categories?tenant=${defaultTenantSlug}`
        : '/admin/dashboard/categories'
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {mode === 'edit' && initial?.id && (
        <>
          <input type="hidden" name="category_id" value={initial.id} />
          <input type="hidden" name="tenant_id" value={initial.tenant_id ?? defaultTenantId ?? ''} />
        </>
      )}

      {defaultTenantSlug && <input type="hidden" name="tenant_slug" value={defaultTenantSlug} />}
      <input type="hidden" name="icon_name" value={iconName} />

      <AdminFormGrid>
        {mode === 'create' && (
          <AdminFormField label="Store" required span={2}>
            <select
              name="tenant_id"
              required
              defaultValue={defaultTenantId ?? tenants[0]?.id ?? ''}
              className={adminSelectClass}
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </AdminFormField>
        )}

        <AdminFormField label="Category name" required>
          <input
            name="name"
            required
            defaultValue={initial?.name ?? ''}
            className={adminInputClass}
            placeholder="e.g. Electronics"
          />
        </AdminFormField>

        <AdminFormField label="Slug" hint="Auto-generated from name if left blank">
          <input
            name="slug"
            defaultValue={initial?.slug ?? ''}
            className={adminInputClass}
            placeholder="electronics"
          />
        </AdminFormField>

        <AdminFormField label="Parent category">
          <select
            name="parent_category_id"
            defaultValue={initial?.parent_category_id ?? ''}
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
            name="sort_order"
            type="number"
            defaultValue={initial?.sort_order ?? 0}
            className={adminInputClass}
          />
        </AdminFormField>

        <AdminFormField
          label="Storefront icon"
          hint="Shown in the category strip on the storefront"
          span={2}
        >
          <CategoryIconPicker value={iconName} onChange={setIconName} />
        </AdminFormField>

        <AdminFormField label="Product count label">
          <input
            name="product_count_text"
            defaultValue={initial?.product_count_text ?? ''}
            placeholder="e.g. 1200+ Products"
            className={adminInputClass}
          />
        </AdminFormField>

        <AdminFormField label="Description" span={2}>
          <textarea
            name="description"
            rows={3}
            defaultValue={initial?.description ?? ''}
            className={adminTextareaClass}
            placeholder="Optional category description"
          />
        </AdminFormField>

        <AdminFormField label="Category image" span={2}>
          <ImageUpload
            folder="categories"
            onUpload={(url) => setImageUrl(url)}
          />
          {imageUrl ? (
            <p className="truncate text-xs text-gray-500">Current image: {imageUrl}</p>
          ) : null}
        </AdminFormField>
      </AdminFormGrid>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={initial?.is_active ?? true}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        Active (visible on storefront)
      </label>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AdminFormActions>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : mode === 'create' ? 'Create category' : 'Save changes'}
        </button>
      </AdminFormActions>
    </form>
  )
}
