'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ui/ImageUpload'
import {
  AdminFormActions,
  AdminFormCard,
  AdminFormField,
  AdminFormGrid,
  AdminPage,
  AdminPageHeader,
  adminInputClass,
  adminTextareaClass,
} from '@/components/admin/admin-ui'

export default function NewProductPage() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('image_url', imageUrl)

    const res = await fetch('/api/admin/products/create', {
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

    router.push('/admin/dashboard/products')
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Create Product"
        description="Add a new product to your store catalog."
      />

      <AdminFormCard>
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <AdminFormGrid>
            <AdminFormField label="Product name" required>
              <input
                name="name"
                required
                className={adminInputClass}
                placeholder="e.g. Classic Leather Watch"
              />
            </AdminFormField>

            <AdminFormField label="SKU">
              <input
                name="sku"
                className={adminInputClass}
                placeholder="e.g. CLW-001"
              />
            </AdminFormField>

            <AdminFormField label="Price" required>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                className={adminInputClass}
                placeholder="0.00"
              />
            </AdminFormField>

            <AdminFormField label="Description" span={2}>
              <textarea
                name="description"
                rows={3}
                className={adminTextareaClass}
                placeholder="Brief description of this product..."
              />
            </AdminFormField>

            <AdminFormField label="Product image" span={2}>
              <ImageUpload
                folder="products"
                onUpload={(url) => setImageUrl(url)}
              />
            </AdminFormField>
          </AdminFormGrid>

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
              {submitting ? 'Creating…' : 'Create product'}
            </button>
          </AdminFormActions>
        </form>
      </AdminFormCard>
    </AdminPage>
  )
}
