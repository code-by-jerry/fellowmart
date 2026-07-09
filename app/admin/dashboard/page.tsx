import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { getSiteSettings } from "@/lib/site-config-server";
import { createAdminClient } from "@/utils/supabase/admin-server";

export default async function DashboardPage() {
  const settings = await getSiteSettings();
  const themeColor = settings.theme_color ?? "#000000";
  const supabase = await createAdminClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  const [productCountResult, activeProductCountResult] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  const totalProducts = productCountResult.count ?? 0;
  const activeProducts = activeProductCountResult.count ?? 0;

  const statCards = [
    {
      label: "Total Products",
      value: totalProducts.toLocaleString(),
      icon: Package,
      href: "/admin/dashboard/products",
    },
    {
      label: "Active Listings",
      value: activeProducts.toLocaleString(),
      icon: TrendingUp,
      href: "/admin/dashboard/products",
    },
    {
      label: "Orders",
      value: "—",
      icon: ShoppingCart,
      href: "/admin/dashboard/orders",
    },
    {
      label: "Customers",
      value: "—",
      icon: Users,
      href: "/admin/dashboard/customers",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div
        className="flex flex-col gap-4 rounded-2xl p-6 text-white sm:flex-row sm:items-center sm:justify-between"
        style={{ backgroundColor: themeColor }}
      >
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/70">
            Admin overview
          </p>
          <h2 className="mt-2 text-2xl font-bold">Welcome back 👋</h2>
          <p className="mt-1 text-sm text-white/70">
            Manage your store — products, orders, and settings, all in one place.
          </p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
          <TrendingUp size={28} className="text-white/80" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
              </div>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl transition group-hover:scale-110"
                style={{ backgroundColor: `${themeColor}18` }}
              >
                <Icon size={22} style={{ color: themeColor }} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-primary transition">
              View all <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/dashboard/products/new"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-primary hover:text-white hover:border-primary"
          >
            <Package size={15} /> Add Product
          </Link>
          <Link
            href="/admin/dashboard/settings"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-primary hover:text-white hover:border-primary"
          >
            ⚙️ Store Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
