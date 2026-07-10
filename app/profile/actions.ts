'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { parseAddressInput } from '@/lib/validation/address'
import { resolveCustomerStoreSlug } from '@/lib/tenant/active-store'
import { storePath } from '@/lib/routes/store-routes'

type ActionResult = { error?: string; success?: string }

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    const slug = await resolveCustomerStoreSlug()
    redirect(`/login?next=${encodeURIComponent(storePath(slug, 'profile'))}`)
  }

  return { supabase, user }
}

async function revalidateProfilePaths() {
  const slug = await resolveCustomerStoreSlug()
  revalidatePath('/profile')
  revalidatePath(storePath(slug, 'profile'))
}

function cleanText(value: FormDataEntryValue | null, required = false): string | null {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text && required) return null
  return text || null
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser()

  const full_name = cleanText(formData.get('full_name'), true)
  const phone = cleanText(formData.get('phone'), true)

  if (!full_name) {
    return { error: 'Full name is required.' }
  }

  if (!phone) {
    return { error: 'Phone number is required.' }
  }

  const digitsOnly = phone.replace(/\D/g, '')
  if (digitsOnly.length < 10) {
    return { error: 'Please enter a valid phone number.' }
  }

  const marketing_opt_in = formData.get('marketing_opt_in') === 'on'

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name,
      phone: digitsOnly,
      marketing_opt_in,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Profile update failed:', error)
    return { error: 'Could not save profile. Please try again.' }
  }

  await revalidateProfilePaths()
  return { success: 'Profile updated successfully.' }
}

export async function createAddress(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser()
  const parsed = parseAddressInput(formData)

  if ('error' in parsed) {
    return { error: parsed.error }
  }

  const { error } = await supabase.from('customer_addresses').insert({
    user_id: user.id,
    ...parsed,
  })

  if (error) {
    console.error('Address create failed:', error)
    return { error: 'Could not save address. Please try again.' }
  }

  await revalidateProfilePaths()
  return { success: 'Address saved successfully.' }
}

export async function updateAddress(addressId: string, formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser()
  const parsed = parseAddressInput(formData)

  if ('error' in parsed) {
    return { error: parsed.error }
  }

  const { error } = await supabase
    .from('customer_addresses')
    .update({
      ...parsed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', addressId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Address update failed:', error)
    return { error: 'Could not update address. Please try again.' }
  }

  await revalidateProfilePaths()
  return { success: 'Address updated successfully.' }
}

export async function deleteAddress(addressId: string): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser()

  const { error } = await supabase
    .from('customer_addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Address delete failed:', error)
    return { error: 'Could not delete address. Please try again.' }
  }

  await revalidateProfilePaths()
  return { success: 'Address removed.' }
}

export async function setDefaultAddress(addressId: string): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser()

  const { error } = await supabase
    .from('customer_addresses')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', addressId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Set default address failed:', error)
    return { error: 'Could not set default address. Please try again.' }
  }

  await revalidateProfilePaths()
  return { success: 'Default address updated.' }
}
