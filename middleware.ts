import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isPlatformAdminEmail } from "@/lib/auth/platform-admin";
import { getLegacyStoreRedirect } from "@/lib/routes/store-routes";
import {
  storeSlugCookieOptions,
  storeSlugFromPathname,
} from "@/lib/tenant/active-store";

export const runtime = "experimental-edge";

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

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const legacyStorePath = getLegacyStoreRedirect(path);
  if (legacyStorePath) {
    return NextResponse.redirect(new URL(legacyStorePath, request.url));
  }

  let supabaseResponse = NextResponse.next({ request });

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

  // Remember last visited store so /profile and other customer pages keep tenant theme
  const visitedStore = storeSlugFromPathname(path);
  if (visitedStore) {
    const cookie = storeSlugCookieOptions(visitedStore);
    supabaseResponse.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  // /login?next=/store/... — persist store context for post-auth redirect
  if (path === "/login") {
    const loginNext = request.nextUrl.searchParams.get("next");
    if (loginNext) {
      const storeFromNext = storeSlugFromPathname(loginNext);
      if (storeFromNext) {
        const cookie = storeSlugCookieOptions(storeFromNext);
        supabaseResponse.cookies.set(cookie.name, cookie.value, cookie.options);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
