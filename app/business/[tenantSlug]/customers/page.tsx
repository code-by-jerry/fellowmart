import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { requireTenantManager } from "@/lib/auth/business-access";
import {
  AdminEmptyState,
  AdminPanel,
  adminTdClass,
  adminThClass,
  adminTableClass,
} from "@/components/admin/admin-ui";
import { listTenantCustomers } from "@/lib/business/tenant-customers";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function BusinessCustomersPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);
  const customers = await listTenantCustomers(supabase, tenant.id);
  const base = `/business/${tenant.slug}/customers`;

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-gray-500">
        Shoppers linked to your store (login, visit, or order) — {customers.length}{" "}
        customer{customers.length === 1 ? "" : "s"}.
      </p>

      <AdminPanel>
        {customers.length === 0 ? (
          <AdminEmptyState
            icon={<Users className="mx-auto h-7 w-7" />}
            message="No customers yet. They appear when someone logs in or shops at your store."
          />
        ) : (
          <>
            <div className="divide-y md:hidden">
              {customers.map((customer) => (
                <Link
                  key={customer.key}
                  href={`${base}/${customer.key}`}
                  className="block space-y-2 p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-gray-900">
                        {customer.name}
                      </p>
                      <p className="truncate text-[12px] text-gray-500">
                        {customer.email}
                      </p>
                    </div>
                    <ChevronRight size={14} className="mt-0.5 shrink-0 text-gray-400" />
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-gray-500">
                    <span className="capitalize">{customer.source}</span>
                    <span>{customer.phone ?? "No phone"}</span>
                    <span>{customer.orderCount} orders</span>
                    <span>{formatMoney(customer.totalSpent)}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className={adminTableClass}>
                <thead>
                  <tr>
                    <th className={adminThClass}>Customer</th>
                    <th className={adminThClass}>Source</th>
                    <th className={adminThClass}>Phone</th>
                    <th className={adminThClass}>Orders</th>
                    <th className={adminThClass}>Spent</th>
                    <th className={adminThClass}>Last seen</th>
                    <th className={adminThClass} />
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.key} className="hover:bg-gray-50/80">
                      <td className={adminTdClass}>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-[12px] text-gray-500">{customer.email}</p>
                      </td>
                      <td className={`${adminTdClass} capitalize`}>{customer.source}</td>
                      <td className={adminTdClass}>{customer.phone ?? "—"}</td>
                      <td className={adminTdClass}>{customer.orderCount}</td>
                      <td className={adminTdClass}>{formatMoney(customer.totalSpent)}</td>
                      <td className={adminTdClass}>
                        {new Date(customer.lastSeenAt).toLocaleDateString()}
                      </td>
                      <td className={`${adminTdClass} text-right`}>
                        <Link
                          href={`${base}/${customer.key}`}
                          className="inline-flex items-center gap-1 text-[13px] font-medium text-gray-700 hover:text-gray-900"
                        >
                          View
                          <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AdminPanel>
    </div>
  );
}
