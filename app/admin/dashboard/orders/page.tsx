import { ShoppingCart } from "lucide-react";
import {
  AdminListHeader,
  AdminPage,
  AdminPanel,
} from "@/components/admin/admin-ui";

export default function OrdersPage() {
  return (
    <AdminPage className="space-y-4 sm:space-y-6">
      <AdminListHeader
        title="Orders"
        description="Track and manage customer orders."
      />

      <AdminPanel className="p-8 text-center sm:p-12">
        <ShoppingCart className="mx-auto mb-4 h-10 w-10 text-gray-300" />
        <h3 className="text-base font-semibold text-gray-700">Coming soon</h3>
        <p className="mt-1 text-sm text-gray-400">
          Order management will be available here.
        </p>
      </AdminPanel>
    </AdminPage>
  );
}
