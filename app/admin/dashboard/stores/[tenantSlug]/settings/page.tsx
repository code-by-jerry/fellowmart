"use server";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin-server";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

async function getTenantMembershipRole(
  supabase: any,
  tenantId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("tenant_memberships")
    .select("role")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.role as string;
}

async function getTenantOwnerCount(supabase: any, tenantId: string) {
  const { data, error } = await supabase
    .from("tenant_memberships")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("role", "owner");

  if (error || !data) {
    return 0;
  }

  return data.length;
}

async function getUserRole(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.role as string;
}

async function getAuthorizedUserRole(
  supabase: any,
  tenantId: string,
  userId: string,
) {
  const userRole = await getUserRole(supabase, userId);
  if (userRole === "admin") {
    return "admin";
  }

  return await getTenantMembershipRole(supabase, tenantId, userId);
}

export async function updateTenantSettings(formData: FormData) {
  const tenantSlug = String(formData.get("tenant_slug") ?? "").trim();
  const logo_url = String(formData.get("logo_url") ?? "").trim();
  const primary_color = String(
    formData.get("primary_color") ?? "#000000",
  ).trim();
  const hero_title = String(formData.get("hero_title") ?? "").trim();
  const hero_subtitle = String(formData.get("hero_subtitle") ?? "").trim();
  const onboarding_status = String(
    formData.get("onboarding_status") ?? "pending",
  );
  const plan_name = String(formData.get("plan_name") ?? "starter");
  const subscription_status = String(
    formData.get("subscription_status") ?? "trial",
  );
  const is_active = formData.get("is_active") === "on";

  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", normalizeTenantSlug(tenantSlug))
    .maybeSingle();

  if (tenantError || !tenant) {
    redirect("/admin/dashboard/stores?error=Tenant not found");
  }

  const currentUserRole = await getTenantMembershipRole(
    supabase,
    tenant.id,
    user.id,
  );

  if (!currentUserRole || !["owner", "admin"].includes(currentUserRole)) {
    redirect("/admin/dashboard/stores?error=Access denied");
  }

  const { error: tenantUpdateError } = await supabase
    .from("tenants")
    .update({
      logo_url: logo_url || null,
      primary_color: primary_color || "#000000",
      onboarding_status,
      is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tenant.id);

  if (tenantUpdateError) {
    redirect("/admin/dashboard/stores?error=Could not update tenant settings");
  }

  const { data: catalogSettings } = await supabase
    .from("tenant_catalog_settings")
    .select("id")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (catalogSettings) {
    await supabase
      .from("tenant_catalog_settings")
      .update({
        hero_title,
        hero_subtitle,
        updated_at: new Date().toISOString(),
      })
      .eq("id", catalogSettings.id);
  } else {
    await supabase.from("tenant_catalog_settings").insert({
      tenant_id: tenant.id,
      hero_title,
      hero_subtitle,
    });
  }

  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (existingSubscription) {
    await supabase
      .from("subscriptions")
      .update({
        plan_name,
        status: subscription_status,
        updated_at: new Date().toISOString(),
      })
      .eq("tenant_id", tenant.id);
  } else {
    await supabase.from("subscriptions").insert({
      tenant_id: tenant.id,
      plan_name,
      status: subscription_status,
      is_active: true,
    });
  }

  redirect(
    `/admin/dashboard/stores/${tenantSlug}/settings?success=Settings updated`,
  );
}

export async function completeTenantOnboarding(formData: FormData) {
  const tenantSlug = String(formData.get("tenant_slug") ?? "").trim();

  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", normalizeTenantSlug(tenantSlug))
    .maybeSingle();

  if (tenantError || !tenant) {
    redirect("/admin/dashboard/stores?error=Tenant not found");
  }

  const currentUserRole = await getTenantMembershipRole(
    supabase,
    tenant.id,
    user.id,
  );

  if (!currentUserRole || !["owner", "admin"].includes(currentUserRole)) {
    redirect("/admin/dashboard/stores?error=Access denied");
  }

  const { error: tenantUpdateError } = await supabase
    .from("tenants")
    .update({
      onboarding_status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", tenant.id);

  if (tenantUpdateError) {
    redirect(
      `/admin/dashboard/stores/${tenantSlug}/settings?error=Could not complete onboarding`,
    );
  }

  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (existingSubscription) {
    await supabase
      .from("subscriptions")
      .update({
        status: "active",
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("tenant_id", tenant.id);
  } else {
    await supabase.from("subscriptions").insert({
      tenant_id: tenant.id,
      plan_name: "starter",
      status: "active",
      is_active: true,
    });
  }

  redirect(
    `/admin/dashboard/stores/${tenantSlug}/settings?success=Onboarding completed`,
  );
}

export async function addTenantMember(formData: FormData) {
  const tenantSlug = String(formData.get("tenant_slug") ?? "").trim();
  const memberEmail = String(formData.get("member_email") ?? "")
    .trim()
    .toLowerCase();
  const memberRole = String(formData.get("member_role") ?? "staff").trim();

  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", normalizeTenantSlug(tenantSlug))
    .maybeSingle();

  if (tenantError || !tenant) {
    redirect("/admin/dashboard/stores?error=Tenant not found");
  }

  const currentUserRole = await getTenantMembershipRole(
    supabase,
    tenant.id,
    user.id,
  );

  if (!currentUserRole || !["owner", "admin"].includes(currentUserRole)) {
    redirect("/admin/dashboard/stores?error=Access denied");
  }

  if (memberRole === "owner" && currentUserRole !== "owner") {
    redirect(
      `/admin/dashboard/stores/${tenantSlug}/settings?error=Only owners can assign owner role`,
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,email")
    .eq("email", memberEmail)
    .maybeSingle();

  if (profileError || !profile) {
    redirect(
      `/admin/dashboard/stores/${tenantSlug}/settings?error=User not found`,
    );
  }

  const { data: existingMembership } = await supabase
    .from("tenant_memberships")
    .select("id")
    .eq("tenant_id", tenant.id)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (existingMembership) {
    redirect(
      `/admin/dashboard/stores/${tenantSlug}/settings?error=User already a member`,
    );
  }

  const { error: insertError } = await supabase
    .from("tenant_memberships")
    .insert({
      tenant_id: tenant.id,
      user_id: profile.id,
      role: memberRole,
    });

  if (insertError) {
    redirect(
      `/admin/dashboard/stores/${tenantSlug}/settings?error=Could not add member`,
    );
  }

  redirect(
    `/admin/dashboard/stores/${tenantSlug}/settings?success=Member added`,
  );
}

export async function removeTenantMember(formData: FormData) {
  const tenantSlug = String(formData.get("tenant_slug") ?? "").trim();
  const membershipId = String(formData.get("membership_id") ?? "").trim();

  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", normalizeTenantSlug(tenantSlug))
    .maybeSingle();

  if (tenantError || !tenant) {
    redirect("/admin/dashboard/stores?error=Tenant not found");
  }

  const currentUserRole = await getTenantMembershipRole(
    supabase,
    tenant.id,
    user.id,
  );

  if (!currentUserRole || !["owner", "admin"].includes(currentUserRole)) {
    redirect("/admin/dashboard/stores?error=Access denied");
  }

  const { data: targetMembership, error: targetMembershipError } =
    await supabase
      .from("tenant_memberships")
      .select("id, role")
      .eq("id", membershipId)
      .eq("tenant_id", tenant.id)
      .maybeSingle();

  if (targetMembershipError || !targetMembership) {
    redirect("/admin/dashboard/stores?error=Membership not found");
  }

  if (targetMembership.role === "owner") {
    const ownerCount = await getTenantOwnerCount(supabase, tenant.id);
    if (ownerCount <= 1) {
      redirect("/admin/dashboard/stores?error=Cannot remove the last owner");
    }
  }

  const { error: deleteError } = await supabase
    .from("tenant_memberships")
    .delete()
    .eq("id", membershipId)
    .eq("tenant_id", tenant.id);

  if (deleteError) {
    redirect(
      `/admin/dashboard/stores/${tenantSlug}/settings?error=Could not remove member`,
    );
  }

  redirect(
    `/admin/dashboard/stores/${tenantSlug}/settings?success=Member removed`,
  );
}

export async function updateTenantMemberRole(formData: FormData) {
  const tenantSlug = String(formData.get("tenant_slug") ?? "").trim();
  const membershipId = String(formData.get("membership_id") ?? "").trim();
  const memberRole = String(formData.get("member_role") ?? "staff").trim();

  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", normalizeTenantSlug(tenantSlug))
    .maybeSingle();

  if (tenantError || !tenant) {
    redirect("/admin/dashboard/stores?error=Tenant not found");
  }

  const currentUserRole = await getTenantMembershipRole(
    supabase,
    tenant.id,
    user.id,
  );

  if (!currentUserRole || !["owner", "admin"].includes(currentUserRole)) {
    redirect("/admin/dashboard/stores?error=Access denied");
  }

  const { data: targetMembership, error: targetMembershipError } =
    await supabase
      .from("tenant_memberships")
      .select("id, role")
      .eq("id", membershipId)
      .eq("tenant_id", tenant.id)
      .maybeSingle();

  if (targetMembershipError || !targetMembership) {
    redirect("/admin/dashboard/stores?error=Membership not found");
  }

  if (targetMembership.role === "owner" && memberRole !== "owner") {
    const ownerCount = await getTenantOwnerCount(supabase, tenant.id);
    if (ownerCount <= 1) {
      redirect("/admin/dashboard/stores?error=Cannot demote the last owner");
    }
  }

  if (memberRole === "owner" && currentUserRole !== "owner") {
    redirect("/admin/dashboard/stores?error=Only owners can assign owner role");
  }

  const { error: updateError } = await supabase
    .from("tenant_memberships")
    .update({ role: memberRole })
    .eq("id", membershipId)
    .eq("tenant_id", tenant.id);

  if (updateError) {
    redirect(
      `/admin/dashboard/stores/${tenantSlug}/settings?error=Could not update member role`,
    );
  }

  redirect(
    `/admin/dashboard/stores/${tenantSlug}/settings?success=Member role updated`,
  );
}

async function getTenantSettings(tenantSlug: string) {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select(
      "id, name, slug, is_active, logo_url, primary_color, onboarding_status, subscriptions(status, plan_name)",
    )
    .eq("slug", normalizeTenantSlug(tenantSlug))
    .maybeSingle();

  if (tenantError || !tenant) {
    redirect("/admin/dashboard/stores?error=Tenant not found");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("tenant_memberships")
    .select("id, role")
    .eq("tenant_id", tenant.id)
    .eq("user_id", user.id)
    .maybeSingle();

  const userProfileRole = await getUserRole(supabase, user.id);
  const isGlobalAdmin = userProfileRole === "admin";

  if (!isGlobalAdmin && (membershipError || !membership)) {
    redirect("/admin/dashboard/stores?error=Access denied");
  }

  const currentUserRole = isGlobalAdmin ? "admin" : (membership?.role as string);

  const { data: catalogSettings, error: catalogError } = await supabase
    .from("tenant_catalog_settings")
    .select("hero_title, hero_subtitle")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (catalogError) {
    redirect("/admin/dashboard/stores?error=Could not load settings");
  }

  const { data: tenantMemberships, error: membershipsError } = await supabase
    .from("tenant_memberships")
    .select("id, role, user_id")
    .eq("tenant_id", tenant.id)
    .order("created_at", { ascending: true });

  if (membershipsError) {
    redirect("/admin/dashboard/stores?error=Could not load members");
  }

  const ownerCount = (tenantMemberships ?? []).filter(
    (membership: any) => membership.role === "owner",
  ).length;

  const userIds = (tenantMemberships ?? []).map(
    (membership: any) => membership.user_id,
  );
  const { data: profileRows, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  if (profilesError) {
    redirect("/admin/dashboard/stores?error=Could not load member profiles");
  }

  const profileById = new Map(
    (profileRows ?? []).map((profile: any) => [profile.id, profile.email]),
  );

  const membershipsWithEmail = (tenantMemberships ?? []).map(
    (membership: any) => ({
      ...membership,
      email: profileById.get(membership.user_id) ?? "unknown",
    }),
  );

  return {
    tenant,
    catalogSettings: catalogSettings ?? { hero_title: "", hero_subtitle: "" },
    tenantMemberships: membershipsWithEmail,
    currentUserRole,
    ownerCount,
  };
}

export default async function TenantSettingsPage({
  params,
}: {
  params: Promise<{ tenantSlug?: string }>;
}) {
  const resolvedParams = await params;
  const tenantSlug = normalizeTenantSlug(resolvedParams?.tenantSlug ?? "");
  if (!tenantSlug) {
    redirect("/admin/dashboard/stores");
  }
  const {
    tenant,
    catalogSettings,
    tenantMemberships,
    currentUserRole,
    ownerCount,
  } = await getTenantSettings(tenantSlug);
  const isOwner = currentUserRole === "owner";

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
            Store management
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {tenant.name} settings
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
            Update tenant branding, onboarding progress, subscription, and team
            access in one clean admin view.
          </p>
        </div>
        <Link
          href="/admin/dashboard/stores"
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          Back to stores
        </Link>
      </div>

      {tenant.onboarding_status !== "completed" && (
        <div className="rounded-3xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
          <p className="font-semibold">
            Tenant approval status: {tenant.onboarding_status}
          </p>
          <p className="mt-1">
            {tenant.onboarding_status === "pending"
              ? "This tenant is waiting for admin approval before the store can be fully active."
              : tenant.onboarding_status === "active"
                ? "This tenant is approved and can continue onboarding. Complete onboarding to fully launch the store."
                : "This tenant is not fully onboarded yet."}
          </p>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent>
            <div className="flex flex-col gap-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Tenant summary
              </h3>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900">Name</p>
                <p>{tenant.name}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Slug</p>
                <p>{tenant.slug}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Onboarding status</p>
                <p>{tenant.onboarding_status}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Subscription</p>
                <p>
                  {tenant.subscriptions && Array.isArray(tenant.subscriptions)
                    ? `${tenant.subscriptions[0]?.plan_name ?? "starter"} / ${
                        tenant.subscriptions[0]?.status ?? "trial"
                      }`
                    : "starter / trial"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Active</p>
                <p>{tenant.is_active ? "Yes" : "No"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="text-sm font-semibold text-gray-700">Branding</h3>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-medium text-gray-900">Primary color</p>
                <div className="mt-2 flex items-center gap-3">
                  <span
                    className="inline-flex h-8 w-8 rounded-full border border-gray-200"
                    style={{
                      backgroundColor: tenant.primary_color || "#000000",
                    }}
                  />
                  <span>{tenant.primary_color || "#000000"}</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Logo URL</p>
                <p className="break-all">{tenant.logo_url || "Not set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <form
        action="/api/admin/tenants/settings/update"
        method="post"
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="tenant_slug" value={tenant.slug} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <Label htmlFor="logo_url">Logo URL</Label>
            <Input
              id="logo_url"
              name="logo_url"
              defaultValue={tenant.logo_url ?? ""}
              className="mt-2"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <Label htmlFor="primary_color">Primary color</Label>
            <Input
              id="primary_color"
              name="primary_color"
              type="color"
              defaultValue={tenant.primary_color ?? "#000000"}
              className="mt-2 h-12 w-24 rounded-xl border border-gray-200 bg-white p-1"
            />
          </div>

          <div>
            <Label htmlFor="hero_title">Hero title</Label>
            <Input
              id="hero_title"
              name="hero_title"
              defaultValue={catalogSettings.hero_title ?? ""}
              className="mt-2"
              placeholder="Your store headline"
            />
          </div>

          <div className="lg:col-span-2">
            <Label htmlFor="hero_subtitle">Hero subtitle</Label>
            <textarea
              id="hero_subtitle"
              name="hero_subtitle"
              defaultValue={catalogSettings.hero_subtitle ?? ""}
              className="mt-2 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              rows={3}
              placeholder="Describe what makes your storefront unique"
            />
          </div>

          <div>
            <Label htmlFor="onboarding_status">Onboarding status</Label>
            <select
              id="onboarding_status"
              name="onboarding_status"
              defaultValue={tenant.onboarding_status ?? "pending"}
              className="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
            {(currentUserRole === "owner" || currentUserRole === "admin") &&
              tenant.onboarding_status !== "completed" && (
                <form
                  action="/api/admin/tenants/onboarding"
                  method="post"
                  className="mt-2"
                >
                  <input type="hidden" name="tenant_slug" value={tenant.slug} />
                  <input
                    type="hidden"
                    name="onboarding_status"
                    value={
                      tenant.onboarding_status === "pending"
                        ? "active"
                        : "completed"
                    }
                  />
                  <Button type="submit" variant="secondary">
                    {tenant.onboarding_status === "pending"
                      ? "Approve tenant"
                      : "Complete onboarding"}
                  </Button>
                </form>
              )}
          </div>

          <div>
            <Label htmlFor="plan_name">Subscription plan</Label>
            <select
              id="plan_name"
              name="plan_name"
              defaultValue={
                tenant.subscriptions && Array.isArray(tenant.subscriptions)
                  ? (tenant.subscriptions[0]?.plan_name ?? "starter")
                  : "starter"
              }
              className="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div>
            <Label htmlFor="subscription_status">Subscription status</Label>
            <select
              id="subscription_status"
              name="subscription_status"
              defaultValue={
                tenant.subscriptions && Array.isArray(tenant.subscriptions)
                  ? (tenant.subscriptions[0]?.status ?? "trial")
                  : "trial"
              }
              className="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is_active"
              type="checkbox"
              name="is_active"
              defaultChecked={tenant.is_active}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label
              htmlFor="is_active"
              className="text-sm font-medium text-gray-700"
            >
              Store is active
            </Label>
          </div>
          <div className="lg:col-span-2 space-y-2 rounded-xl border border-dashed border-gray-200 bg-slate-50 p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900">Subscription state</p>
            <p>
              Current plan:{" "}
              {tenant.subscriptions && Array.isArray(tenant.subscriptions)
                ? (tenant.subscriptions[0]?.plan_name ?? "starter")
                : "starter"}
            </p>
            <p>
              Billing status:{" "}
              {tenant.subscriptions && Array.isArray(tenant.subscriptions)
                ? (tenant.subscriptions[0]?.status ?? "trial")
                : "trial"}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save settings</Button>
        </div>
      </form>

      <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Team members
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Add or remove users from this tenant and assign roles.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 p-4">
            {tenantMemberships.length === 0 ? (
              <p className="text-sm text-gray-500">No members yet.</p>
            ) : (
              <div className="space-y-3">
                {tenantMemberships.map((membership: any) => (
                  <div
                    key={membership.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-slate-50 p-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {membership.email ?? "Unknown user"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Role: {membership.role}
                      </p>
                      <form
                        action="/api/admin/tenants/members/update-role"
                        method="post"
                        className="mt-2 flex items-center gap-2"
                      >
                        <input
                          type="hidden"
                          name="tenant_slug"
                          value={tenant.slug}
                        />
                        <input
                          type="hidden"
                          name="membership_id"
                          value={membership.id}
                        />
                        <select
                          name="member_role"
                          defaultValue={membership.role}
                          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                          {isOwner && <option value="owner">Owner</option>}
                          <option value="admin">Admin</option>
                          <option value="staff">Staff</option>
                        </select>
                        <Button type="submit" variant="secondary">
                          Save role
                        </Button>
                      </form>
                    </div>
                    <form
                      action="/api/admin/tenants/members/remove"
                      method="post"
                    >
                      <input
                        type="hidden"
                        name="tenant_slug"
                        value={tenant.slug}
                      />
                      <input
                        type="hidden"
                        name="membership_id"
                        value={membership.id}
                      />
                      <Button
                        type="submit"
                        variant="secondary"
                        disabled={
                          membership.role === "owner" && ownerCount <= 1
                        }
                      >
                        Remove
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

      <form
            action="/api/admin/tenants/members/add"
            method="post"
            className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4"
          >
            <input type="hidden" name="tenant_slug" value={tenant.slug} />
            <div>
              <Label htmlFor="member_email">User email</Label>
              <Input
                id="member_email"
                name="member_email"
                type="email"
                required
                className="mt-2"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="member_role">Role</Label>
              <select
                id="member_role"
                name="member_role"
                defaultValue="staff"
                className="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {isOwner && <option value="owner">Owner</option>}
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
              {!isOwner && (
                <p className="mt-2 text-xs text-gray-500">
                  Only owners can add new owners.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="member_password">Password</Label>
              <Input
                id="member_password"
                name="member_password"
                type="password"
                className="mt-2"
                placeholder="Optional for existing user"
              />
              <p className="mt-2 text-xs text-gray-500">
                Provide a password only if creating a new user.
              </p>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Add member
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
