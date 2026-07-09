import Link from "next/link";
import { PlusCircle, Store } from "lucide-react";
import { redirect } from "next/navigation";
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Stores</h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage tenant requests, approval, and onboarding status.
            </p>
          </div>
          <Link
            href="/admin/dashboard/stores/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <PlusCircle size={16} />
            New Store
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        {tenantList.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            <Store className="mx-auto mb-3 h-8 w-8 text-gray-300" />
            No stores yet. Create your first tenant to begin onboarding.
          </div>
        ) : (
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
                      <div className="flex gap-2">
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
        )}
      </div>
    </div>
  );
}
