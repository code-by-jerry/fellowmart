import Link from "next/link";
import { requireTenantManager } from "@/lib/auth/business-access";
import {
  AdminEmptyState,
  AdminPanel,
  adminTdClass,
  adminThClass,
  adminTableClass,
} from "@/components/admin/admin-ui";
import { listTenantOrders } from "@/lib/business/tenant-orders";
import { businessOrderDetailPath } from "@/lib/storefront/store-links";
import { Package } from "lucide-react";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700",
    confirmed: "bg-blue-50 text-blue-700",
    pending: "bg-amber-50 text-amber-700",
    payment_failed: "bg-red-50 text-red-700",
    cancelled: "bg-gray-100 text-gray-600",
  };
  return styles[status] ?? "bg-gray-100 text-gray-700";
}

export default async function BusinessOrdersPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);
  const orders = await listTenantOrders(supabase, tenant.id);

  return (
    <div className="space-y-3">
      <p className="text-[13px] text-gray-500">
        Store orders and Razorpay payments — {orders.length} order
        {orders.length === 1 ? "" : "s"}.
      </p>

      <AdminPanel>
        {orders.length === 0 ? (
          <AdminEmptyState
            icon={<Package className="mx-auto h-7 w-7" />}
            message="No orders yet. They appear when customers checkout from your storefront."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTableClass}>
              <thead>
                <tr>
                  <th className={adminThClass}>Order</th>
                  <th className={adminThClass}>Customer</th>
                  <th className={adminThClass}>Total</th>
                  <th className={adminThClass}>Status</th>
                  <th className={adminThClass}>Payment</th>
                  <th className={adminThClass}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80">
                    <td className={adminTdClass}>
                      <Link
                        href={businessOrderDetailPath(tenantSlug, order.order_number)}
                        className="font-medium text-gray-900 hover:text-primary"
                      >
                        {order.order_number}
                      </Link>
                      {order.razorpay_payment_id ? (
                        <p className="text-[11px] text-gray-500">
                          {order.razorpay_payment_id}
                        </p>
                      ) : null}
                    </td>
                    <td className={adminTdClass}>
                      <p className="font-medium text-gray-900">
                        {order.customer_name}
                      </p>
                      <p className="text-[12px] text-gray-500">
                        {order.customer_email}
                      </p>
                    </td>
                    <td className={adminTdClass}>
                      {formatMoney(order.total_amount)}
                    </td>
                    <td className={adminTdClass}>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusBadge(order.status)}`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className={adminTdClass}>
                      <p className="capitalize text-gray-900">
                        {order.payment_method ?? "cod"}
                      </p>
                      {order.payment_status ? (
                        <p className="text-[12px] capitalize text-gray-500">
                          {order.payment_status}
                        </p>
                      ) : null}
                    </td>
                    <td className={adminTdClass}>
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      <p className="text-[12px] text-gray-500">
        Configure Razorpay keys in server environment variables. Webhook URL:{" "}
        <code className="rounded bg-gray-100 px-1.5 py-0.5">
          /api/webhooks/razorpay
        </code>
      </p>
    </div>
  );
}
