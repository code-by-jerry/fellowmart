import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceRoleClient } from "@/utils/supabase/service-role-client";
import { upsertTenantCustomer } from "@/lib/business/tenant-customer-upsert";
import { normalizeTenantSlug } from "@/lib/utils/tenant";

function storeSlugFromNext(next: string): string | null {
  const match = next.match(/^\/store\/([^/?#]+)/);
  if (!match) return null;
  return normalizeTenantSlug(decodeURIComponent(match[1]));
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // ignore — middleware refreshes sessions
            }
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const storeSlug = storeSlugFromNext(next);
      if (user && storeSlug) {
        try {
          const db = createServiceRoleClient();
          const { data: tenant } = await db
            .from("tenants")
            .select("id")
            .eq("slug", storeSlug)
            .maybeSingle();

          if (tenant) {
            await upsertTenantCustomer({
              tenantId: tenant.id,
              userId: user.id,
              email: user.email ?? "",
              name:
                (user.user_metadata?.full_name as string | undefined) ??
                (user.user_metadata?.name as string | undefined) ??
                null,
              source: "login",
            });
          }
        } catch (err) {
          console.error(
            "[auth/callback] tenant customer attribute:",
            err instanceof Error ? err.message : err,
          );
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=AuthError`);
}
