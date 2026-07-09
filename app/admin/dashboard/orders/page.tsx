import { ShoppingCart } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-semibold text-slate-900">Orders</h2>
        <p className="mt-2 text-sm text-slate-500">Track and manage customer orders.</p>
      </div>
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-16 text-center">
        <ShoppingCart className="mx-auto mb-4 h-10 w-10 text-gray-300" />
        <h3 className="text-base font-semibold text-gray-700">Coming soon</h3>
        <p className="mt-1 text-sm text-gray-400">Order management will be available here.</p>
      </div>
    </div>
  );
}
