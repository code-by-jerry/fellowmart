import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  canManageTenant,
  getTenantAccess,
  getUserTenants,
} from "@/lib/business/provision-tenant";
import type { TenantMembershipRole } from "@/lib/types/business";

/** Per-request cache — layout + page must not each hit Supabase auth. */
const getBusinessUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/business/login");
  }

  return { supabase, user };
});

export const requireBusinessUser = cache(async () => getBusinessUser());

export async function getBusinessSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const tenants = await getUserTenants(supabase, user.id);
  return { supabase, user, tenants };
}

export const requireTenantManager = cache(async (tenantSlug: string) => {
  const { supabase, user } = await getBusinessUser();
  const access = await getTenantAccess(supabase, user.id, tenantSlug);

  if (!access || !canManageTenant(access.role)) {
    redirect("/business?error=You do not have access to this business.");
  }

  return { supabase, user, ...access };
});

export async function requireTenantRole(
  tenantSlug: string,
  roles: TenantMembershipRole[],
) {
  const session = await requireTenantManager(tenantSlug);
  if (!roles.includes(session.role)) {
    redirect(`/business/${tenantSlug}?error=Insufficient permissions.`);
  }
  return session;
}
