'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin-server'

export async function login(formData: FormData) {
  const supabase = await createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return redirect('/admin/login?error=Could not authenticate user')
  }

  // Fetch role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  revalidatePath('/admin', 'layout')

  if (profile?.role === 'admin') {
    redirect('/admin/dashboard')
  } else {
    // Note: Since we are using an admin specific client, if they are not admin
    // we should sign them out of the admin client.
    await supabase.auth.signOut()
    redirect('/admin/login?error=Access denied. Admin accounts only.')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'admin', // for now we assign admin role on this specific signup page
      },
    },
  })

  if (error) {
    return redirect('/admin/register?error=Could not create user')
  }

  revalidatePath('/admin', 'layout')
  redirect('/admin/dashboard')
}
