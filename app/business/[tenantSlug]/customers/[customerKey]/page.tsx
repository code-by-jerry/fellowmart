import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireTenantManager } from "@/lib/auth/business-access";
import {
  AdminPanel,
  adminTdClass,
  adminThClass,
  adminTableClass,
} from "@/components/admin/admin-ui";
import {
  formatShippingSnippet,
  getTenantCustomerDetail,
} from "@/lib/business/tenant-customers";
import { formatAddressLine } from "@/lib/types/customer";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function BusinessCustomerDetailPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; customerKey: string }>;
}) {
  const { tenantSlug, customerKey } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);
  const customer = await getTenantCustomerDetail(
    supabase,
    tenant.id,
    decodeURIComponent(customerKey),
  );

  if (!customer) notFound();

  const latestDelivery = formatShippingSnippet(customer.latestShipping);

  return (
    <div className="space-y-4">
      <Link
        href={`/business/${tenant.slug}/customers`}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={14} />
        Customers
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{customer.name}</h2>
          <p className="mt-0.5 text-[13px] text-gray-500">{customer.email}</p>
        </div>
        <div className="flex gap-4 text-[13px] text-gray-600">
          <div>
            <span className="text-gray-400">Orders </span>
            <span className="font-medium text-gray-900">{customer.orderCount}</span>
          </div>
          <div>
            <span className="text-gray-400">Spent </span>
            <span className="font-medium text-gray-900">
              {formatMoney(customer.totalSpent)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel>
          <div className="border-b border-gray-100 px-4 py-2.5">
            <p className="text-[13px] font-medium text-gray-900">Contact</p>
          </div>
          <dl className="grid gap-3 p-4 text-[13px] sm:grid-cols-2">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-gray-400">Phone</dt>
              <dd className="mt-0.5 font-medium text-gray-900">
                {customer.phone ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-gray-400">Account</dt>
              <dd className="mt-0.5 font-medium text-gray-900">
                {customer.userId ? "Registered" : "Guest checkout"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-gray-400">Source</dt>
              <dd className="mt-0.5 font-medium capitalize text-gray-900">
                {customer.source}
              </dd>
            </div>
            {latestDelivery ? (
              <div className="sm:col-span-2">
                <dt className="text-[11px] uppercase tracking-wide text-gray-400">
                  Latest delivery
                </dt>
                <dd className="mt-0.5 text-gray-700">{latestDelivery}</dd>
              </div>
            ) : null}
          </dl>
        </AdminPanel>

        <AdminPanel>
          <div className="border-b border-gray-100 px-4 py-2.5">
            <p className="text-[13px] font-medium text-gray-900">Saved addresses</p>
          </div>
          {customer.addresses.length === 0 ? (
            <p className="px-4 py-6 text-[13px] text-gray-400">
              No saved addresses on file.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {customer.addresses.map((address) => (
                <li key={address.id} className="px-4 py-3 text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{address.label}</span>
                    {address.is_default ? (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-gray-600">{formatAddressLine(address)}</p>
                  <p className="mt-0.5 text-[12px] text-gray-400">{address.phone}</p>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>

      <AdminPanel>
        <div className="border-b border-gray-100 px-4 py-2.5">
          <p className="text-[13px] font-medium text-gray-900">Orders at this store</p>
        </div>
        <div className="overflow-x-auto">
          <table className={adminTableClass}>
            <thead>
              <tr>
                <th className={adminThClass}>Order</th>
                <th className={adminThClass}>Status</th>
                <th className={adminThClass}>Total</th>
                <th className={adminThClass}>Date</th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.map((order) => (
                <tr key={order.id}>
                  <td className={`${adminTdClass} font-medium text-gray-900`}>
                    {order.order_number}
                  </td>
                  <td className={`${adminTdClass} capitalize`}>{order.status}</td>
                  <td className={adminTdClass}>
                    {formatMoney(Number(order.total_amount) || 0)}
                  </td>
                  <td className={adminTdClass}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}
