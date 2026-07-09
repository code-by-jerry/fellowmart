import { createClient } from '@/utils/supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function getUserTenantMemberships(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tenant_memberships')
    .select('tenant_id, role')
    .eq('user_id', userId)

  if (error) {
    return []
  }

  return data ?? []
}
