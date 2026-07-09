"use client";

import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";
import { ADMIN_SHELL_HEADER_CLASS } from "@/components/admin/admin-ui";
import { useAdminLayout } from "@/components/admin/AdminLayoutProvider";

const pageTitles: { prefix: string; title: string }[] = [
  { prefix: "/admin/dashboard/settings", title: "Site Settings" },
  { prefix: "/admin/dashboard/applications", title: "Applications" },
  { prefix: "/admin/dashboard/stores/new", title: "Create Business" },
  { prefix: "/admin/dashboard/stores/", title: "Store Settings" },
  { prefix: "/admin/dashboard/stores", title: "Stores" },
  { prefix: "/admin/dashboard/products/new", title: "New Product" },
  { prefix: "/admin/dashboard/products", title: "Products" },
  { prefix: "/admin/dashboard/categories/new", title: "New Category" },
  { prefix: "/admin/dashboard/categories/", title: "Edit Category" },
  { prefix: "/admin/dashboard/categories", title: "Categories" },
  { prefix: "/admin/dashboard/customers/", title: "Customer Details" },
  { prefix: "/admin/dashboard/customers", title: "Customers" },
  { prefix: "/admin/dashboard/orders", title: "Orders" },
  { prefix: "/admin/dashboard", title: "Dashboard" },
];

function getPageTitle(pathname: string) {
  const match = pageTitles.find(({ prefix }) => pathname.startsWith(prefix));
  return match?.title ?? "Admin";
}

export default function Topbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const { mobileOpen, setMobileOpen } = useAdminLayout();

  return (
    <header
      className={`${ADMIN_SHELL_HEADER_CLASS} sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-3 sm:px-5 lg:px-6`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <Menu size={20} />
        </button>
        <h1 className="truncate text-base font-semibold text-gray-900">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm text-gray-500 md:flex">
          <Search size={14} />
          <input
            className="w-32 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 lg:w-40"
            placeholder="Search..."
          />
        </div>

        <button
          type="button"
          className="relative rounded-lg p-1.5 transition hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell size={17} className="text-gray-600" />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
          A
        </div>
      </div>
    </header>
  );
}
