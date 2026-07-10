'use client'

import { useState, useTransition } from 'react'
import { Home, MapPin, Pencil, Plus, Star, Trash2, X } from 'lucide-react'
import {
  createAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
} from '@/app/profile/actions'
import { ADDRESS_LABELS, INDIAN_STATES } from '@/lib/constants/india'
import { formatAddressLine, type AddressLabel, type CustomerAddress } from '@/lib/types/customer'

type AddressManagerProps = {
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

function AddressForm({
  address,
  profileDefaults,
  onCancel,
  onSuccess,
}: {
  address?: CustomerAddress
  profileDefaults?: AddressManagerProps['profileDefaults']
  onCancel: () => void
  onSuccess: (message: string) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const isEditing = Boolean(address)

  const handleSubmit = (formData: FormData) => {
    setError('')

    startTransition(async () => {
      const result = isEditing
        ? await updateAddress(address!.id, formData)
        : await createAddress(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      onSuccess(result.success ?? (isEditing ? 'Address updated.' : 'Address saved.'))
    })
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          {isEditing ? 'Edit address' : 'Add new address'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1 text-gray-400 hover:bg-white hover:text-gray-600"
          aria-label="Close form"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form action={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Label</label>
          <select
            name="label"
            defaultValue={address?.label ?? 'Home'}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {ADDRESS_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            name="full_name"
            required
            defaultValue={address?.full_name ?? profileDefaults?.full_name ?? ''}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            name="phone"
            type="tel"
            required
            defaultValue={address?.phone ?? profileDefaults?.phone ?? ''}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Address line 1 <span className="text-red-500">*</span>
          </label>
          <input
            name="address_line1"
            required
            defaultValue={address?.address_line1 ?? ''}
            placeholder="House / flat / building, street"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Address line 2</label>
          <input
            name="address_line2"
            defaultValue={address?.address_line2 ?? ''}
            placeholder="Area, colony (optional)"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Landmark</label>
          <input
            name="landmark"
            defaultValue={address?.landmark ?? ''}
            placeholder="Nearby landmark (optional)"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            City <span className="text-red-500">*</span>
          </label>
          <input
            name="city"
            required
            defaultValue={address?.city ?? ''}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            State <span className="text-red-500">*</span>
          </label>
          <select
            name="state"
            required
            defaultValue={address?.state ?? ''}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="" disabled>
              Select state
            </option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            PIN code <span className="text-red-500">*</span>
          </label>
          <input
            name="postal_code"
            required
            inputMode="numeric"
            maxLength={6}
            defaultValue={address?.postal_code ?? ''}
            placeholder="6-digit PIN"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <input type="hidden" name="country" value={address?.country ?? 'IN'} />

        <div className="flex items-center sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="is_default"
              defaultChecked={address?.is_default ?? false}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            Set as default delivery address
          </label>
        </div>

        {error && (
          <div className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 sm:col-span-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : isEditing ? 'Update address' : 'Save address'}
          </button>
        </div>
      </form>
    </div>
  )
}

export function AddressManager({ addresses, profileDefaults }: AddressManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleDelete = (addressId: string) => {
    setMessage('')
    setError('')

    startTransition(async () => {
      const result = await deleteAddress(addressId)
      if (result.error) {
        setError(result.error)
        return
      }
      setMessage(result.success ?? 'Address removed.')
      if (editingId === addressId) {
        setEditingId(null)
      }
    })
  }

  const handleSetDefault = (addressId: string) => {
    setMessage('')
    setError('')

    startTransition(async () => {
      const result = await setDefaultAddress(addressId)
      if (result.error) {
        setError(result.error)
        return
      }
      setMessage(result.success ?? 'Default address updated.')
    })
  }

  const handleFormSuccess = (successMessage: string) => {
    setShowForm(false)
    setEditingId(null)
    setMessage(successMessage)
    setError('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Delivery addresses</h2>
          <p className="text-sm text-gray-500">Save addresses for faster checkout.</p>
        </div>
        {!showForm && !editingId && (
          <button
            type="button"
            onClick={() => {
              setShowForm(true)
              setMessage('')
              setError('')
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add address
          </button>
        )}
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <AddressForm
          profileDefaults={profileDefaults}
          onCancel={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
          <MapPin className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-700">No saved addresses yet</p>
          <p className="mt-1 text-sm text-gray-500">Add your first delivery address to speed up checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {addresses.map((address) => {
            const Icon = labelIcon[address.label as AddressLabel] ?? MapPin

            if (editingId === address.id) {
              return (
                <AddressForm
                  key={address.id}
                  address={address}
                  profileDefaults={profileDefaults}
                  onCancel={() => setEditingId(null)}
                  onSuccess={handleFormSuccess}
                />
              )
            }

            return (
              <div
                key={address.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{address.label}</h3>
                        {address.is_default && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                            <Star className="h-3 w-3 fill-current" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-800">{address.full_name}</p>
                      <p className="mt-1 text-sm text-gray-600">{formatAddressLine(address)}</p>
                      <p className="mt-1 text-sm text-gray-500">{address.phone}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {!address.is_default && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSetDefault(address.id)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-gray-100 disabled:opacity-50"
                      >
                        Set default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(address.id)
                        setShowForm(false)
                        setMessage('')
                        setError('')
                      }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                      aria-label="Edit address"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(address.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label="Delete address"
                    >
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
