import Link from "next/link";
import { CreditCard, Pencil, PlusCircle, Trash2 } from "lucide-react";
import {
  AdminEmptyState,
  AdminListHeader,
  AdminPage,
  AdminPanel,
} from "@/components/admin/admin-ui";
import { getAdminDataClient } from "@/lib/admin/auth";
import { listSubscriptionPlans } from "@/lib/subscriptions/plans";

type SubscriptionPlansPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function SubscriptionPlansPage({
  searchParams,
}: SubscriptionPlansPageProps) {
  const { success, error } = await searchParams;
  const db = await getAdminDataClient();
  const plans = await listSubscriptionPlans(db);

  return (
    <AdminPage className="space-y-4 sm:space-y-6">
      <AdminListHeader
        title="Subscription Plans"
        description="Manage pricing tiers, features, and billing labels used across the platform."
        action={
          <Link
            href="/admin/dashboard/subscription-plans/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <PlusCircle size={16} />
            New plan
          </Link>
        }
      />

      {success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <AdminPanel>
        {plans.length === 0 ? (
          <AdminEmptyState
            icon={<CreditCard className="mx-auto h-8 w-8" />}
            message="No subscription plans yet. Create your first plan."
          />
        ) : (
          <>
            <div className="divide-y md:hidden">
              {plans.map((plan) => (
                <div key={plan.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{plan.name}</p>
                      <p className="text-xs text-gray-500">{plan.slug}</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {plan.is_featured ? (
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          Featured
                        </span>
                      ) : null}
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          plan.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {plan.is_active ? "active" : "hidden"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-gray-400">Price</span>
                      <span className="font-medium text-gray-700">
                        {plan.price_display}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Features</span>
                      <span className="font-medium text-gray-700">
                        {plan.features.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={`/admin/dashboard/subscription-plans/${plan.id}/edit`}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Pencil size={14} />
                      Edit
                    </Link>
                    <form action="/api/admin/subscription-plans/delete" method="post">
                      <input type="hidden" name="plan_id" value={plan.id} />
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Plan
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Billing
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Features
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id} className="border-t last:border-b">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{plan.name}</div>
                        <div className="text-xs text-gray-500">{plan.slug}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{plan.price_display}</td>
                      <td className="px-4 py-3 capitalize text-gray-500">
                        {plan.billing_period}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{plan.features.length}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {plan.is_featured ? (
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                              Featured
                            </span>
                          ) : null}
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              plan.is_active
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {plan.is_active ? "active" : "hidden"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/dashboard/subscription-plans/${plan.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil size={14} />
                            Edit
                          </Link>
                          <form action="/api/admin/subscription-plans/delete" method="post">
                            <input type="hidden" name="plan_id" value={plan.id} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AdminPanel>
    </AdminPage>
  );
}
