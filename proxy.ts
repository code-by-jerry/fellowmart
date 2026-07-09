import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isPlatformAdminEmail } from "@/lib/auth/platform-admin";

function createCustomerClient(
  request: NextRequest,
  onCookies: (cookies: { name: string; value: string; options?: object }[]) => void,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          onCookies(cookiesToSet);
        },
      },
    },
  );
}

function createAdminSessionClient(
  request: NextRequest,
  onCookies: (cookies: { name: string; value: string; options?: object }[]) => void,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          onCookies(cookiesToSet);
        },
      },
      cookieOptions: {
        name: "sb-admin-auth-token",
      },
    },
  );
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  const applyCookies = (
    cookiesToSet: { name: string; value: string; options?: object }[],
  ) => {
    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
    supabaseResponse = NextResponse.next({ request });
    cookiesToSet.forEach(({ name, value, options }) =>
      supabaseResponse.cookies.set(name, value, options),
    );
  };

  // Refresh customer session on all routes
  const customerClient = createCustomerClient(request, applyCookies);
  await customerClient.auth.getUser();

  // Protect /business routes (login handled on page; refresh session here)
  if (path.startsWith("/business")) {
    await customerClient.auth.getUser();
  }

  // Protect /admin routes (login only is public)
  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    const adminClient = createAdminSessionClient(request, applyCookies);
    const {
      data: { user },
    } = await adminClient.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (!isPlatformAdminEmail(user.email)) {
      const signOutResponse = NextResponse.redirect(
        new URL(
          "/admin/login?error=Access denied. Admin accounts only.",
          request.url,
        ),
      );
      await adminClient.auth.signOut();
      return signOutResponse;
    }
  }

  // Redirect /dashboard shortcut → /admin/dashboard
  if (path.startsWith("/dashboard")) {
    return NextResponse.redirect(
      new URL(path.replace("/dashboard", "/admin/dashboard"), request.url),
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
