import { NextResponse } from "next/server";
import { getTenantAccess } from "@/lib/business/provision-tenant";
import { createClient } from "@/utils/supabase/server";

export async function requireBusinessApiTenant(tenantSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    } as const;
  }

  const access = await getTenantAccess(supabase, user.id, tenantSlug);
  if (!access) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    } as const;
  }

  return { supabase, user, tenant: access.tenant } as const;
}
