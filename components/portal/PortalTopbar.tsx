"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu, Search } from "lucide-react";
import { ADMIN_SHELL_HEADER_CLASS } from "@/components/admin/admin-ui";
import { useAdminLayout } from "@/components/admin/AdminLayoutProvider";
import { NotificationBell } from "@/components/portal/NotificationBell";
import { storePath } from "@/lib/routes/store-routes";

const platformTitles: { prefix: string; title: string }[] = [
  { prefix: "/admin/dashboard/subscription-plans", title: "Subscription Plans" },
  { prefix: "/admin/dashboard/settings", title: "Platform Settings" },
  { prefix: "/admin/dashboard/activity", title: "Activity" },
  { prefix: "/admin/dashboard/applications", title: "Applications" },
  { prefix: "/admin/dashboard/stores/new", title: "Create Business" },
  { prefix: "/admin/dashboard/stores/", title: "Business Settings" },
  { prefix: "/admin/dashboard/stores", title: "Businesses" },
  { prefix: "/admin/dashboard/customers/", title: "Customer Details" },
  { prefix: "/admin/dashboard/customers", title: "Customers" },
  { prefix: "/admin/dashboard", title: "Platform Dashboard" },
];

const businessTitles: { prefix: string; title: string }[] = [
  { prefix: "/products/new", title: "New Product" },
  { prefix: "/products/", title: "Edit Product" },
  { prefix: "/products", title: "Products" },
  { prefix: "/brands", title: "Brands" },
  { prefix: "/categories", title: "Categories" },
  { prefix: "/collections", title: "Collections" },
  { prefix: "/subscription", title: "Subscription" },
  { prefix: "/orders", title: "Orders" },
  { prefix: "/customers", title: "Customers" },
  { prefix: "/payments", title: "Payments" },
  { prefix: "/activity", title: "Activity" },
  { prefix: "/settings", title: "Store Settings" },
];

function getTitle(pathname: string, mode: "platform" | "business", tenantName?: string) {
  if (mode === "platform") {
    const match = platformTitles.find(({ prefix }) => pathname.startsWith(prefix));
    return match?.title ?? "Platform Admin";
  }

  const match = businessTitles.find(({ prefix }) => pathname.includes(prefix));
  if (match) return match.title;
  if (tenantName) return tenantName;
  return "Business Dashboard";
}

type PortalTopbarProps = {
  mode: "platform" | "business";
  tenantName?: string;
  tenantSlug?: string;
};

export function PortalTopbar({ mode, tenantName, tenantSlug }: PortalTopbarProps) {
  const pathname = usePathname();
  const title = getTitle(pathname, mode, tenantName);
  const { mobileOpen, setMobileOpen } = useAdminLayout();

  return (
    <header
      className={`${ADMIN_SHELL_HEADER_CLASS} sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 sm:px-4`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <Menu size={18} />
        </button>
        <h1 className="truncate text-[15px] font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {mode === "business" && tenantSlug ? (
          <Link
            href={storePath(tenantSlug)}
            target="_blank"
            rel="noreferrer"
            className="hidden h-8 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 text-[13px] font-medium text-gray-700 transition hover:bg-gray-50 sm:inline-flex"
          >
            <ExternalLink size={13} />
            View store
          </Link>
        ) : null}

        <div className="hidden h-8 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2 text-[13px] text-gray-500 md:flex">
          <Search size={13} />
          <input
            className="w-28 bg-transparent text-[13px] text-gray-800 outline-none placeholder:text-gray-400 lg:w-36"
            placeholder="Search..."
          />
        </div>

        <NotificationBell
          audience={mode === "platform" ? "platform" : "tenant"}
          tenantSlug={tenantSlug}
          activityHref={
            mode === "platform"
              ? "/admin/dashboard/activity"
              : `/business/${tenantSlug}/activity`
          }
        />

        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white">
          {mode === "platform" ? "A" : (tenantName?.charAt(0).toUpperCase() ?? "B")}
        </div>
      </div>
    </header>
  );
}
