import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import {
  AdminEmptyState,
  AdminListHeader,
  AdminPage,
  AdminPanel,
} from "@/components/admin/admin-ui";
import { getAdminDataClient } from "@/lib/admin/auth";

export default async function CustomersPage() {
  const db = await getAdminDataClient();

  const { data: customers } = await db
    .from("profiles")
    .select("id, email, full_name, phone, marketing_opt_in, role, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  const customerList = customers ?? [];
  const customerIds = customerList.map((customer) => customer.id);

  const { data: addressRows } = customerIds.length
    ? await db.from("customer_addresses").select("user_id").in("user_id", customerIds)
    : { data: [] };

  const addressCountByUser = new Map<string, number>();
  for (const row of addressRows ?? []) {
    addressCountByUser.set(row.user_id, (addressCountByUser.get(row.user_id) ?? 0) + 1);
  }

  return (
    <AdminPage className="space-y-4 sm:space-y-6">
      <AdminListHeader
        title="Customers"
        description="Platform-wide shopper accounts. Each store manages its own customers under Business → Customers."
      />

      <AdminPanel>
        {customerList.length === 0 ? (
          <AdminEmptyState
            icon={<Users className="mx-auto h-8 w-8" />}
            message="No customers yet."
          />
        ) : (
          <>
            <div className="divide-y md:hidden">
              {customerList.map((customer) => (
                <div key={customer.id} className="space-y-3 p-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {customer.full_name ?? customer.email?.split("@")[0] ?? "Customer"}
                    </p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-gray-400">Phone</span>
                      <span className="font-medium text-gray-700">
                        {customer.phone ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Addresses</span>
                      <span className="font-medium text-gray-700">
                        {addressCountByUser.get(customer.id) ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Marketing</span>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          customer.marketing_opt_in
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {customer.marketing_opt_in ? "opted in" : "opted out"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Joined</span>
                      <span className="font-medium text-gray-700">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/admin/dashboard/customers/${customer.id}`}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Manage
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Phone</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Marketing</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Addresses</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Joined</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customerList.map((customer) => (
                    <tr key={customer.id} className="border-t last:border-b">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {customer.full_name ?? customer.email?.split("@")[0] ?? "Customer"}
                        </div>
                        <div className="text-gray-500">{customer.email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{customer.phone ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            customer.marketing_opt_in
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {customer.marketing_opt_in ? "opted in" : "opted out"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {addressCountByUser.get(customer.id) ?? 0}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/dashboard/customers/${customer.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Manage
                          <ChevronRight size={14} />
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
    </AdminPage>
  );
}
