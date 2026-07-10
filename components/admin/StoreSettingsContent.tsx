import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  ExternalLink,
  Store,
  Users,
} from "lucide-react";
import {
  AdminFormActions,
  AdminFormCard,
  AdminFormField,
  AdminFormGrid,
  AdminPage,
  AdminPageHeader,
  adminInputClass,
  adminSelectClass,
} from "@/components/admin/admin-ui";
import { getPlanLabel } from "@/lib/admin/store-plans";
import { storePath } from "@/lib/routes/store-routes";
import type { SubscriptionPlan } from "@/lib/types/subscription-plan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StoreStatusBadge } from "@/components/admin/StoreStatusBadge";

type Membership = {
  id: string;
  role: string;
  email: string;
};

type TeamRequest = {
  id: string;
  member_email: string;
  requested_role: string;
  status: string;
  notes: string | null;
  created_at: string;
};

type StoreSettingsContentProps = {
  tenant: {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    onboarding_status: string;
    subscriptions?: Array<{ plan_name?: string; status?: string }> | null;
  };
  tenantMemberships: Membership[];
  teamRequests: TeamRequest[];
  currentUserRole: string;
  ownerCount: number;
  planOptions: SubscriptionPlan[];
  success?: string;
  error?: string;
};

function subscriptionOf(tenant: StoreSettingsContentProps["tenant"]) {
  const sub =
    tenant.subscriptions && Array.isArray(tenant.subscriptions)
      ? tenant.subscriptions[0]
      : null;
  return {
    plan: sub?.plan_name ?? "starter",
    status: sub?.status ?? "trial",
  };
}

export function StoreSettingsContent({
  tenant,
  tenantMemberships,
  teamRequests,
  currentUserRole,
  ownerCount,
  planOptions,
  success,
  error,
}: StoreSettingsContentProps) {
  const canManage = ["owner", "admin"].includes(currentUserRole);
  const { plan, status: billingStatus } = subscriptionOf(tenant);
  const storefrontUrl = storePath(tenant.slug);
  const businessUrl = `/business/${tenant.slug}`;
  const needsApproval = tenant.onboarding_status === "pending";
  const canAdvanceOnboarding =
    canManage && tenant.onboarding_status !== "completed";
  const pendingRequests = teamRequests.filter((r) => r.status === "pending");

  return (
    <AdminPage className="space-y-6">
      <AdminPageHeader
        title={`${tenant.name} — tenant`}
        description="Manage membership, subscription, and status. Store branding is owned by the business portal."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/dashboard/stores"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <ArrowLeft size={15} />
              Back
            </Link>
            <Link
              href={storefrontUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <ExternalLink size={15} />
              Storefront
            </Link>
            <Link
              href={`${businessUrl}/settings`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Store settings
            </Link>
          </div>
        }
      />

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {needsApproval ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
              <Building2 size={20} />
            </span>
            <div>
              <p className="font-semibold text-amber-950">Awaiting approval</p>
              <p className="mt-0.5 text-sm text-amber-900/80">
                This tenant cannot fully launch until a platform admin approves the
                application.
              </p>
            </div>
          </div>
          {canAdvanceOnboarding ? (
            <form action="/api/admin/tenants/onboarding" method="post">
              <input type="hidden" name="tenant_slug" value={tenant.slug} />
              <input type="hidden" name="onboarding_status" value="active" />
              <Button type="submit">Approve tenant</Button>
            </form>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Onboarding",
            value: tenant.onboarding_status,
            icon: Building2,
            badge: true,
          },
          {
            label: "Plan",
            value: getPlanLabel(plan),
            icon: CreditCard,
            badge: false,
          },
          {
            label: "Billing",
            value: billingStatus,
            icon: CreditCard,
            badge: true,
          },
          {
            label: "Store",
            value: tenant.is_active ? "Live" : "Inactive",
            icon: Store,
            badge: false,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {stat.label}
              </p>
              <stat.icon size={16} className="text-gray-400" />
            </div>
            <div className="mt-2">
              {stat.badge ? (
                <StoreStatusBadge value={String(stat.value)} />
              ) : (
                <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <form action="/api/admin/tenants/settings/update" method="post">
            <input type="hidden" name="tenant_slug" value={tenant.slug} />

            <AdminFormCard
              title="Subscription & status"
              description="Plan, billing state, and store visibility. Branding is edited in the business portal."
              icon={<CreditCard size={18} />}
            >
              <AdminFormGrid>
                <AdminFormField label="Onboarding status">
                  <select
                    name="onboarding_status"
                    defaultValue={tenant.onboarding_status ?? "pending"}
                    className={adminSelectClass}
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </AdminFormField>

                <AdminFormField label="Subscription plan">
                  <select
                    name="plan_name"
                    defaultValue={plan}
                    className={adminSelectClass}
                  >
                    {planOptions.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.name} — {option.price_display}
                      </option>
                    ))}
                  </select>
                </AdminFormField>

                <AdminFormField label="Billing status">
                  <select
                    name="subscription_status"
                    defaultValue={billingStatus}
                    className={adminSelectClass}
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </select>
                </AdminFormField>

                <AdminFormField label="Store visibility">
                  <label className="flex h-11 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/80 px-4">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={tenant.is_active}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Store is active and publicly visible
                    </span>
                  </label>
                </AdminFormField>
              </AdminFormGrid>

              <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-600">
                <span className="font-medium text-gray-900">
                  {getPlanLabel(plan, planOptions)}
                </span>
                <span className="mx-2 text-gray-300">·</span>
                Billing: <StoreStatusBadge value={billingStatus} className="ml-1" />
              </div>

              <AdminFormActions>
                <Button type="submit">Save tenant</Button>
              </AdminFormActions>
            </AdminFormCard>
          </form>

          {canAdvanceOnboarding && tenant.onboarding_status === "active" ? (
            <form
              action="/api/admin/tenants/onboarding"
              method="post"
              className="flex justify-end"
            >
              <input type="hidden" name="tenant_slug" value={tenant.slug} />
              <input type="hidden" name="onboarding_status" value="completed" />
              <Button type="submit" variant="secondary">
                Mark onboarding complete
              </Button>
            </form>
          ) : null}
        </div>

        <aside className="space-y-6">
          <AdminFormCard
            title="Quick links"
            description="Jump to this tenant's live surfaces."
          >
            <div className="space-y-2">
              <Link
                href={storefrontUrl}
                target="_blank"
                className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Public storefront
                <ExternalLink size={14} className="text-gray-400" />
              </Link>
              <Link
                href={`${businessUrl}/settings`}
                className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Business store settings
                <ExternalLink size={14} className="text-gray-400" />
              </Link>
            </div>
            <dl className="mt-4 space-y-3 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">URL</dt>
                <dd className="font-mono text-xs text-gray-800">{storefrontUrl}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Members</dt>
                <dd className="font-medium text-gray-900">{tenantMemberships.length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Pending requests</dt>
                <dd className="font-medium text-gray-900">{pendingRequests.length}</dd>
              </div>
            </dl>
          </AdminFormCard>

          <AdminFormCard
            title="Store customization"
            description="Owned by the store admin."
          >
            <p className="text-sm text-gray-600">
              Logo, theme color, SEO, and homepage copy are managed in the business
              portal — not here. Platform settings only control the Fellowmate landing page.
            </p>
            <Link
              href={`${businessUrl}/settings`}
              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
            >
              Open store settings →
            </Link>
          </AdminFormCard>
        </aside>
      </div>

      {pendingRequests.length > 0 ? (
        <AdminFormCard
          title="Team access requests"
          description="Store owners requested these members. Add them below when approved."
          icon={<Users size={18} />}
        >
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="bg-white">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {req.member_email}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-700">
                      {req.requested_role}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{req.notes ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminFormCard>
      ) : null}

      <AdminFormCard
        title="Team members"
        description="Invite users and manage roles for this business."
        icon={<Users size={18} />}
      >
        {tenantMemberships.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 text-center text-sm text-gray-500">
            No team members yet. Add the store owner or staff below.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="hidden md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tenantMemberships.map((membership) => (
                    <tr key={membership.id} className="bg-white">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {membership.email}
                      </td>
                      <td className="px-4 py-3">
                        <StoreStatusBadge value={membership.role} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <form
                            action="/api/admin/tenants/members/update-role"
                            method="post"
                            className="flex items-center gap-2"
                          >
                            <input type="hidden" name="tenant_slug" value={tenant.slug} />
                            <input type="hidden" name="membership_id" value={membership.id} />
                            <select
                              name="member_role"
                              defaultValue={membership.role}
                              className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                            >
                              <option value="owner">Owner</option>
                              <option value="admin">Admin</option>
                              <option value="staff">Staff</option>
                            </select>
                            <Button type="submit" variant="secondary" size="sm">
                              Update
                            </Button>
                          </form>
                          <form action="/api/admin/tenants/members/remove" method="post">
                            <input type="hidden" name="tenant_slug" value={tenant.slug} />
                            <input type="hidden" name="membership_id" value={membership.id} />
                            <Button
                              type="submit"
                              variant="secondary"
                              size="sm"
                              disabled={membership.role === "owner" && ownerCount <= 1}
                            >
                              Remove
                            </Button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y md:hidden">
              {tenantMemberships.map((membership) => (
                <div key={membership.id} className="space-y-3 bg-white p-4">
                  <div>
                    <p className="font-medium text-gray-900">{membership.email}</p>
                    <StoreStatusBadge value={membership.role} className="mt-1" />
                  </div>
                  <form
                    action="/api/admin/tenants/members/update-role"
                    method="post"
                    className="flex flex-wrap gap-2"
                  >
                    <input type="hidden" name="tenant_slug" value={tenant.slug} />
                    <input type="hidden" name="membership_id" value={membership.id} />
                    <select
                      name="member_role"
                      defaultValue={membership.role}
                      className={adminSelectClass}
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                    </select>
                    <Button type="submit" variant="secondary" size="sm">
                      Update role
                    </Button>
                  </form>
                  <form action="/api/admin/tenants/members/remove" method="post">
                    <input type="hidden" name="tenant_slug" value={tenant.slug} />
                    <input type="hidden" name="membership_id" value={membership.id} />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      disabled={membership.role === "owner" && ownerCount <= 1}
                    >
                      Remove member
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

        <form
          action="/api/admin/tenants/members/add"
          method="post"
          className="mt-6 rounded-xl border border-gray-200 bg-gray-50/50 p-4"
        >
          <input type="hidden" name="tenant_slug" value={tenant.slug} />
          <p className="text-sm font-semibold text-gray-900">Add team member</p>
          <AdminFormGrid className="mt-4">
            <AdminFormField label="Email" required>
              <Input
                name="member_email"
                type="email"
                required
                placeholder="user@example.com"
                className={adminInputClass}
              />
            </AdminFormField>
            <AdminFormField label="Role">
              <select name="member_role" defaultValue="staff" className={adminSelectClass}>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </AdminFormField>
            <AdminFormField label="Password" hint="Only if creating a new user account">
              <Input
                name="member_password"
                type="password"
                placeholder="Optional"
                className={adminInputClass}
              />
            </AdminFormField>
          </AdminFormGrid>
          <div className="mt-4 flex justify-end">
            <Button type="submit">Add member</Button>
          </div>
        </form>
      </AdminFormCard>
    </AdminPage>
  );
}
