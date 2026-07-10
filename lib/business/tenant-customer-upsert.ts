import { createServiceRoleClient } from "@/utils/supabase/service-role-client";

export type TenantCustomerSource =
  | "visit"
  | "login"
  | "order"
  | "import"
  | "signup";

type UpsertTenantCustomerInput = {
  tenantId: string;
  userId?: string | null;
  email: string;
  name?: string | null;
  phone?: string | null;
  source?: TenantCustomerSource;
};

/**
 * Link a shopper to a store for CRM/reach.
 * Safe to call often; never throws to callers.
 */
export async function upsertTenantCustomer(
  input: UpsertTenantCustomerInput,
): Promise<void> {
  try {
    const email = input.email.trim().toLowerCase();
    if (!email || !input.tenantId) return;

    const db = createServiceRoleClient();
    const now = new Date().toISOString();
    const source = input.source ?? "visit";

    let existingQuery = db
      .from("tenant_customers")
      .select("id, source, name, phone, user_id")
      .eq("tenant_id", input.tenantId)
      .limit(1);

    if (input.userId) {
      existingQuery = existingQuery.eq("user_id", input.userId);
    } else {
      existingQuery = existingQuery.ilike("email", email);
    }

    const { data: existing } = await existingQuery.maybeSingle();

    if (existing) {
      const patch: Record<string, unknown> = {
        last_seen_at: now,
        updated_at: now,
        email,
      };
      if (input.userId && !existing.user_id) patch.user_id = input.userId;
      if (input.name && !existing.name) patch.name = input.name;
      if (input.phone && !existing.phone) patch.phone = input.phone;
      // Promote source toward stronger signals: visit < login < order
      const rank: Record<string, number> = {
        visit: 1,
        signup: 2,
        login: 3,
        import: 3,
        order: 4,
      };
      if ((rank[source] ?? 0) > (rank[existing.source] ?? 0)) {
        patch.source = source;
      }

      await db.from("tenant_customers").update(patch).eq("id", existing.id);
      return;
    }

    await db.from("tenant_customers").insert({
      tenant_id: input.tenantId,
      user_id: input.userId ?? null,
      email,
      name: input.name ?? null,
      phone: input.phone ?? null,
      source,
      first_seen_at: now,
      last_seen_at: now,
    });
  } catch (error) {
    console.error(
      "[upsertTenantCustomer]",
      error instanceof Error ? error.message : error,
    );
  }
}

export async function attributeStoreVisitor(opts: {
  tenantId: string;
  tenantSlug: string;
  userId: string;
  email?: string | null;
  name?: string | null;
  source?: TenantCustomerSource;
}) {
  if (!opts.email) return;
  await upsertTenantCustomer({
    tenantId: opts.tenantId,
    userId: opts.userId,
    email: opts.email,
    name: opts.name,
    source: opts.source ?? "visit",
  });
}
