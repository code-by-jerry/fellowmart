'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { CustomerProfile } from '@/lib/types/customer'
import {
  AdminFormActions,
  AdminFormField,
  AdminFormGrid,
  adminInputClass,
} from '@/components/admin/admin-ui'

type AdminCustomerProfileFormProps = {
  profile: CustomerProfile
}

export function AdminCustomerProfileForm({ profile }: AdminCustomerProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleSubmit = (formData: FormData) => {
    setError('')

    startTransition(async () => {
      const res = await fetch('/api/admin/customers/update', {
        method: 'POST',
        body: formData,
      })

      if (res.redirected) {
        router.push(new URL(res.url).pathname + new URL(res.url).search)
        router.refresh()
        return
      }

      const json = await res.json().catch(() => ({}))
      setError(json.error ?? 'Could not update profile')
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="user_id" value={profile.id} />

      <AdminFormGrid>
        <AdminFormField label="Email" span={2}>
          <input
            type="email"
            value={profile.email ?? ''}
            disabled
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
          />
        </AdminFormField>

        <AdminFormField label="Full name" required>
          <input
            id="full_name"
            name="full_name"
            required
            defaultValue={profile.full_name ?? ''}
            className={adminInputClass}
          />
        </AdminFormField>

        <AdminFormField label="Phone" required>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            defaultValue={profile.phone ?? ''}
            className={adminInputClass}
          />
        </AdminFormField>

        <div className="lg:col-span-2">
          <label className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <input
              type="checkbox"
              name="marketing_opt_in"
              defaultChecked={profile.marketing_opt_in}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Marketing opt-in</span>
              <span className="mt-0.5 block text-xs text-gray-500">
                Customer agreed to receive marketing communications.
              </span>
            </span>
          </label>
        </div>
      </AdminFormGrid>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AdminFormActions>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save profile'}
        </button>
      </AdminFormActions>
    </form>
  )
}
