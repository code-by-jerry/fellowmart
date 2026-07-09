"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { createAdminClient } from "@/utils/supabase/admin-client";
import { useRouter } from "next/navigation";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/dashboard/products", icon: Package },
  { label: "Orders", href: "/admin/dashboard/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/dashboard/customers", icon: Users },
  { label: "Settings", href: "/admin/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const settings = useSiteSettings();

  const handleLogout = async () => {
    const supabase = createAdminClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white text-gray-600 border border-gray-200 shadow-sm lg:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white text-gray-900 border-r border-gray-200 flex flex-col z-40 transition-transform duration-300 shadow-sm
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b border-gray-100">
          <span className="text-xl font-bold tracking-tight text-primary">
            {settings.app_name}
          </span>
          <span className="block text-xs text-gray-400 mt-0.5">
            Admin Panel
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
