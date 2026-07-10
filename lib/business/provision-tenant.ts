import type { SupabaseClient } from "@supabase/supabase-js";
import { validateTenantSlug } from "@/lib/routes/store-routes";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import type {
  BusinessType,
  ProvisionTenantInput,
  ProvisionTenantResult,
  TenantMembershipRole,
  TenantWithMembership,
} from "@/lib/types/business";

const MANAGEMENT_ROLES: TenantMembershipRole[] = ["owner", "admin", "staff"];

export async function findUserIdByEmail(
  db: SupabaseClient,
  email: string,
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  let page = 1;

  while (true) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === normalized,
    );
    if (match) return match.id;
    if (data.users.length < 200) break;
    page += 1;
  }

  return null;
}

export async function provisionTenant(
  db: SupabaseClient,
  input: ProvisionTenantInput,
): Promise<ProvisionTenantResult> {
  const slug = normalizeTenantSlug(input.businessSlug || input.businessName);
  const ownerEmail = input.ownerEmail.trim().toLowerCase();

  const slugError = validateTenantSlug(slug);
  if (slugError) {
    throw new Error(slugError);
  }

  const { data: existingTenant } = await db
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingTenant) {
    throw new Error(`The store slug "${slug}" is already taken.`);
  }

  let ownerUserId = await findUserIdByEmail(db, ownerEmail);
  let createdOwner = false;

  if (!ownerUserId) {
    const { data, error } = await db.auth.admin.createUser({
      email: ownerEmail,
      email_confirm: true,
      user_metadata: {
        full_name: input.ownerName ?? input.businessName,
        role: "customer",
      },
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? "Could not create owner account.");
    }

    ownerUserId = data.user.id;
    createdOwner = true;
  }

  await db.from("profiles").upsert(
    {
      id: ownerUserId,
      email: ownerEmail,
      role: "customer",
      full_name: input.ownerName ?? null,
      phone: input.ownerPhone ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  const onboardingStatus = input.onboardingStatus ?? "active";
  const isActive = input.isActive ?? onboardingStatus !== "pending";

  const { data: tenant, error: tenantError } = await db
    .from("tenants")
    .insert({
      name: input.businessName.trim(),
      slug,
      owner_id: ownerUserId,
      business_type: input.businessType as BusinessType,
      contact_email: ownerEmail,
      contact_phone: input.ownerPhone ?? null,
      business_description: input.businessDescription ?? null,
      address_line1: input.addressLine1 ?? null,
      city: input.city ?? null,
      state: input.state ?? null,
      postal_code: input.postalCode ?? null,
      country: input.country ?? "IN",
      onboarding_status: onboardingStatus,
      is_active: isActive,
      approved_at: new Date().toISOString(),
      approved_by: input.approvedByUserId ?? null,
    })
    .select("id, slug")
    .single();

  if (tenantError || !tenant) {
    throw new Error(tenantError?.message ?? "Could not create tenant.");
  }

  const { error: membershipError } = await db.from("tenant_memberships").insert({
    tenant_id: tenant.id,
    user_id: ownerUserId,
    role: "owner",
  });

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const { data: existingSubscription } = await db
    .from("subscriptions")
    .select("id")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (existingSubscription) {
    await db
      .from("subscriptions")
      .update({
        plan_name: "starter",
        status: isActive ? "trial" : "trial",
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("tenant_id", tenant.id);
  } else {
    await db.from("subscriptions").insert({
      tenant_id: tenant.id,
      plan_name: "starter",
      status: "trial",
      is_active: isActive,
    });
  }

  return {
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    ownerUserId,
    createdOwner,
  };
}

export async function getUserTenants(
  db: SupabaseClient,
  userId: string,
): Promise<TenantWithMembership[]> {
  const { data, error } = await db
    .from("tenant_memberships")
    .select(
      "role, tenants(id, name, slug, business_type, onboarding_status, is_active, logo_url)",
    )
    .eq("user_id", userId)
    .in("role", MANAGEMENT_ROLES);

  if (error || !data) return [];

  return data
    .map((row) => {
      const tenantData = row.tenants;
      const tenant = (Array.isArray(tenantData) ? tenantData[0] : tenantData) as
        | Omit<TenantWithMembership, "role">
        | null;
      if (!tenant) return null;
      return { ...tenant, role: row.role as TenantMembershipRole };
    })
    .filter(Boolean) as TenantWithMembership[];
}

export async function getTenantAccess(
  db: SupabaseClient,
  userId: string,
  tenantSlug: string,
): Promise<{ tenant: TenantWithMembership; role: TenantMembershipRole } | null> {
  const slug = normalizeTenantSlug(tenantSlug);

  const { data: tenant, error: tenantError } = await db
    .from("tenants")
    .select("id, name, slug, business_type, onboarding_status, is_active, logo_url")
    .eq("slug", slug)
    .maybeSingle();

  if (tenantError || !tenant) return null;

  const { data: membership, error: membershipError } = await db
    .from("tenant_memberships")
    .select("role")
    .eq("tenant_id", tenant.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError || !membership) return null;

  const role = membership.role as TenantMembershipRole;
  if (!MANAGEMENT_ROLES.includes(role)) return null;

  return { tenant: { ...tenant, role }, role };
}

export function canManageTenant(role: TenantMembershipRole) {
  return MANAGEMENT_ROLES.includes(role);
}

export function canManageTeam(role: TenantMembershipRole) {
  return role === "owner" || role === "admin";
}
