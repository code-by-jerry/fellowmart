'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/app/profile/actions'
import type { CustomerProfile } from '@/lib/types/customer'

type ProfileDetailsFormProps = {
  profile: Pick<CustomerProfile, 'full_name' | 'phone' | 'marketing_opt_in'>
  email: string
}

export function ProfileDetailsForm({ profile, email }: ProfileDetailsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (formData: FormData) => {
    setMessage('')
    setError('')

    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.error) {
        setError(result.error)
        return
      }
      setMessage(result.success ?? 'Profile updated.')
    })
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          disabled
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
        />
        <p className="mt-1 text-xs text-gray-400">Managed by your sign-in provider</p>
      </div>

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
          Full name <span className="text-red-500">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          defaultValue={profile.full_name ?? ''}
          placeholder="Your full name"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone number <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={profile.phone ?? ''}
          placeholder="10-digit mobile number"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 cursor-pointer">
        <input
          type="checkbox"
          name="marketing_opt_in"
          defaultChecked={profile.marketing_opt_in}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span>
          <span className="block text-sm font-medium text-gray-900">Marketing updates</span>
          <span className="block text-xs text-gray-500 mt-0.5">
            Receive offers, new arrivals, and order updates by SMS or email.
          </span>
        </span>
      </label>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save profile'}
        </button>
      </div>
    </form>
  )
}
