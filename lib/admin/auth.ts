import { redirect } from "next/navigation";
import { isPlatformAdminProfile } from "@/lib/auth/platform-admin";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { createAdminClient } from "@/utils/supabase/admin-server";
import { createServiceRoleClient } from "@/utils/supabase/service-role-client";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAdminDataClient(): Promise<SupabaseClient> {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!isPlatformAdminProfile(profile)) {
    redirect("/admin/login?error=Access denied. Admin accounts only.");
  }

  return createServiceRoleClient();
}

export async function requirePlatformAdminApi(): Promise<{
  userId: string;
  db: SupabaseClient;
}> {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!isPlatformAdminProfile(profile)) {
    throw new Error("FORBIDDEN");
  }

  return { userId: user.id, db: createServiceRoleClient() };
}

export async function requirePlatformAdminTenant(tenantSlugInput: string): Promise<{
  userId: string;
  db: SupabaseClient;
  tenant: { id: string };
  tenantSlug: string;
}> {
  const { userId, db } = await requirePlatformAdminApi();
  const tenantSlug = normalizeTenantSlug(tenantSlugInput);

  const { data: tenant, error } = await db
    .from("tenants")
    .select("id")
    .eq("slug", tenantSlug)
    .maybeSingle();

  if (error || !tenant) {
    throw new Error("TENANT_NOT_FOUND");
  }

  return { userId, db, tenant, tenantSlug };
}
