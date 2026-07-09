'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Home, MapPin, Pencil, Plus, Star, Trash2, X } from 'lucide-react'
import { ADDRESS_LABELS, INDIAN_STATES } from '@/lib/constants/india'
import { formatAddressLine, type AddressLabel, type CustomerAddress } from '@/lib/types/customer'

type AdminAddressManagerProps = {
  userId: string
  addresses: CustomerAddress[]
  profileDefaults?: {
    full_name?: string | null
    phone?: string | null
  }
}

const labelIcon = {
  Home,
  Work: MapPin,
  Other: MapPin,
} as const

function AdminAddressForm({
  userId,
  address,
  profileDefaults,
  onCancel,
  onSuccess,
}: {
  userId: string
  address?: CustomerAddress
  profileDefaults?: AdminAddressManagerProps['profileDefaults']
  onCancel: () => void
  onSuccess: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const isEditing = Boolean(address)

  const handleSubmit = (formData: FormData) => {
    setError('')
    formData.set('user_id', userId)
    if (address) formData.set('address_id', address.id)

    const action = isEditing
      ? '/api/admin/customers/addresses/update'
      : '/api/admin/customers/addresses/create'

    startTransition(async () => {
      const res = await fetch(action, { method: 'POST', body: formData })

      if (res.redirected) {
        router.push(new URL(res.url).pathname + new URL(res.url).search)
        router.refresh()
        onSuccess()
        return
      }

      const json = await res.json().catch(() => ({}))
      setError(json.error ?? 'Could not save address')
    })
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          {isEditing ? 'Edit address' : 'Add address'}
        </h3>
        <button type="button" onClick={onCancel} className="rounded-lg p-1 text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form action={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Label</label>
          <select
            name="label"
            defaultValue={address?.label ?? 'Home'}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          >
            {ADDRESS_LABELS.map((label) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Full name *</label>
          <input
            name="full_name"
            required
            defaultValue={address?.full_name ?? profileDefaults?.full_name ?? ''}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Phone *</label>
          <input
            name="phone"
            type="tel"
            required
            defaultValue={address?.phone ?? profileDefaults?.phone ?? ''}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Address line 1 *</label>
          <input
            name="address_line1"
            required
            defaultValue={address?.address_line1 ?? ''}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Address line 2</label>
          <input
            name="address_line2"
            defaultValue={address?.address_line2 ?? ''}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Landmark</label>
          <input
            name="landmark"
            defaultValue={address?.landmark ?? ''}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">City *</label>
          <input name="city" required defaultValue={address?.city ?? ''} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">State *</label>
          <select name="state" required defaultValue={address?.state ?? ''} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm">
            <option value="" disabled>Select state</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">PIN code *</label>
          <input
            name="postal_code"
            required
            maxLength={6}
            defaultValue={address?.postal_code ?? ''}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
          />
        </div>
        <input type="hidden" name="country" value={address?.country ?? 'IN'} />
        <div className="lg:col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="is_default"
              defaultChecked={address?.is_default ?? false}
              className="h-4 w-4 rounded border-gray-300 text-primary"
            />
            Set as default
          </label>
        </div>
        {error && (
          <div className="lg:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2 lg:col-span-2">
          <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={isPending} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {isPending ? 'Saving...' : isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

export function AdminAddressManager({ userId, addresses, profileDefaults }: AdminAddressManagerProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const postAction = async (action: string, formData: FormData) => {
    const res = await fetch(action, { method: 'POST', body: formData })
    if (res.redirected) {
      router.push(new URL(res.url).pathname + new URL(res.url).search)
      router.refresh()
    }
  }

  const handleDelete = (addressId: string) => {
    const formData = new FormData()
    formData.set('user_id', userId)
    formData.set('address_id', addressId)
    startTransition(() => postAction('/api/admin/customers/addresses/delete', formData))
  }

  const handleSetDefault = (addressId: string) => {
    const formData = new FormData()
    formData.set('user_id', userId)
    formData.set('address_id', addressId)
    startTransition(() => postAction('/api/admin/customers/addresses/set-default', formData))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Delivery addresses</h3>
        {!showForm && !editingId && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Add address
          </button>
        )}
      </div>

      {showForm && (
        <AdminAddressForm
          userId={userId}
          profileDefaults={profileDefaults}
          onCancel={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {addresses.length === 0 && !showForm ? (
        <p className="text-sm text-gray-500">No saved addresses.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => {
            const Icon = labelIcon[address.label as AddressLabel] ?? MapPin

            if (editingId === address.id) {
              return (
                <AdminAddressForm
                  key={address.id}
                  userId={userId}
                  address={address}
                  profileDefaults={profileDefaults}
                  onCancel={() => setEditingId(null)}
                  onSuccess={() => setEditingId(null)}
                />
              )
            }

            return (
              <div key={address.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{address.label}</span>
                        {address.is_default && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                            <Star className="h-3 w-3 fill-current" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-800">{address.full_name}</p>
                      <p className="text-sm text-gray-600">{formatAddressLine(address)}</p>
                      <p className="text-sm text-gray-500">{address.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!address.is_default && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSetDefault(address.id)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5"
                      >
                        Set default
                      </button>
                    )}
                    <button type="button" onClick={() => setEditingId(address.id)} className="rounded-lg p-2 text-gray-400 hover:text-gray-700">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" disabled={isPending} onClick={() => handleDelete(address.id)} className="rounded-lg p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
