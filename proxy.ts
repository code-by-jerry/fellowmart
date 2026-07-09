import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session (keeps auth cookies alive)
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Protect /admin routes (except login & register) — fast check, no DB needed
  if (
    path.startsWith('/admin') &&
    !path.startsWith('/admin/login') &&
    !path.startsWith('/admin/register')
  ) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    // Fine-grained role check (admin vs customer) happens inside the layout
  }

  // Protect customer routes
  if (
    !path.startsWith('/admin') && 
    path !== '/' && 
    !path.startsWith('/login') && 
    !path.startsWith('/signup') && 
    !path.startsWith('/auth')
  ) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect /dashboard shortcut → /admin/dashboard
  if (path.startsWith('/dashboard')) {
    return NextResponse.redirect(
      new URL(path.replace('/dashboard', '/admin/dashboard'), request.url)
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
