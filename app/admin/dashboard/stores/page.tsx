import Link from "next/link";
import { PlusCircle, Store } from "lucide-react";
import { redirect } from "next/navigation";
import {
  AdminEmptyState,
  AdminListHeader,
  AdminPage,
  AdminPanel,
} from "@/components/admin/admin-ui";
import { createAdminClient } from "@/utils/supabase/admin-server";

export default async function StoresPage() {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  const { data: tenants } = await supabase
    .from("tenants")
    .select(
      "id, name, slug, is_active, onboarding_status, subscriptions(status, plan_name)",
    )
    .order("created_at", { ascending: false });

  const tenantList = tenants ?? [];

  return (
    <AdminPage className="space-y-4 sm:space-y-6">
      <AdminListHeader
        title="Businesses"
        description="Manage onboarded tenants, subscriptions, and approval status."
        action={
          <Link
            href="/admin/dashboard/stores/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <PlusCircle size={16} />
            New Business
          </Link>
        }
      />

      <AdminPanel>
        {tenantList.length === 0 ? (
          <AdminEmptyState
            icon={<Store className="mx-auto h-8 w-8" />}
            message="No stores yet. Create your first tenant to begin onboarding."
          />
        ) : (
          <>
            <div className="divide-y md:hidden">
              {tenantList.map((tenant: any) => {
                const plan =
                  tenant.subscriptions && Array.isArray(tenant.subscriptions)
                    ? tenant.subscriptions[0]
                    : null;

                return (
                  <div key={tenant.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-xs text-gray-500">/{tenant.slug}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        {tenant.onboarding_status ?? "pending"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div>
                        <span className="block text-gray-400">Status</span>
                        <span className="font-medium text-gray-700">
                          {tenant.is_active ? "active" : "inactive"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-gray-400">Subscription</span>
                        <span className="font-medium text-gray-700">
                          {plan
                            ? `${plan.plan_name} / ${plan.status}`
                            : "starter / trial"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <a
                        href={`/admin/dashboard/stores/${tenant.slug}/settings`}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Manage
                      </a>
                      {(tenant.onboarding_status === "pending" ||
                        tenant.onboarding_status === "active") && (
                        <form
                          action="/api/admin/tenants/onboarding"
                          method="post"
                          className="w-full sm:w-auto"
                        >
                          <input
                            type="hidden"
                            name="tenant_slug"
                            value={tenant.slug}
                          />
                          <input
                            type="hidden"
                            name="onboarding_status"
                            value={
                              tenant.onboarding_status === "pending"
                                ? "active"
                                : "completed"
                            }
                          />
                          <button
                            type="submit"
                            className="w-full rounded-lg border border-primary bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                          >
                            {tenant.onboarding_status === "pending"
                              ? "Approve"
                              : "Complete onboarding"}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Slug
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Onboarding
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Subscription
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tenantList.map((tenant: any) => {
                    const plan =
                      tenant.subscriptions && Array.isArray(tenant.subscriptions)
                        ? tenant.subscriptions[0]
                        : null;

                    return (
                      <tr key={tenant.id} className="border-t last:border-b">
                        <td className="px-4 py-3 text-gray-900">{tenant.name}</td>
                        <td className="px-4 py-3 text-gray-500">/{tenant.slug}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                            {tenant.onboarding_status ?? "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {tenant.is_active ? "active" : "inactive"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {plan
                            ? `${plan.plan_name} / ${plan.status}`
                            : "starter / trial"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`/admin/dashboard/stores/${tenant.slug}/settings`}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Manage
                            </a>
                            {(tenant.onboarding_status === "pending" ||
                              tenant.onboarding_status === "active") && (
                              <form
                                action="/api/admin/tenants/onboarding"
                                method="post"
                                className="inline-flex"
                              >
                                <input
                                  type="hidden"
                                  name="tenant_slug"
                                  value={tenant.slug}
                                />
                                <input
                                  type="hidden"
                                  name="onboarding_status"
                                  value={
                                    tenant.onboarding_status === "pending"
                                      ? "active"
                                      : "completed"
                                  }
                                />
                                <button
                                  type="submit"
                                  className="rounded-lg border border-primary bg-primary/10 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/20"
                                >
                                  {tenant.onboarding_status === "pending"
                                    ? "Approve"
                                    : "Complete onboarding"}
                                </button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AdminPanel>
    </AdminPage>
  );
}
