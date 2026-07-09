'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ui/ImageUpload'

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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Create a product</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Add a new product to your store catalog.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="mt-8 grid gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Product name <span className="text-red-500">*</span></label>
              <input
                name="name"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="e.g. Classic Leather Watch"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">SKU</label>
              <input
                name="sku"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="e.g. CLW-001"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Price <span className="text-red-500">*</span></label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              placeholder="Brief description of this product..."
            />
          </div>

          {/* Product image */}
          <div className="space-y-2">
            <ImageUpload
              label="Product image"
              folder="products"
              onUpload={(url) => setImageUrl(url)}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
