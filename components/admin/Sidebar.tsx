"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  ClipboardList,
  Settings,
  ShoppingCart,
  Store,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { createAdminClient } from "@/utils/supabase/admin-client";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { useAdminLayout } from "@/components/admin/AdminLayoutProvider";
import { ADMIN_SHELL_HEADER_CLASS } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  separatorBefore?: boolean;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Products",
    href: "/admin/dashboard/products",
    icon: Package,
    separatorBefore: true,
  },
  {
    label: "Categories",
    href: "/admin/dashboard/categories",
    icon: FolderTree,
  },
  {
    label: "Orders",
    href: "/admin/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    label: "Customers",
    href: "/admin/dashboard/customers",
    icon: Users,
    separatorBefore: true,
  },
  {
    label: "Stores",
    href: "/admin/dashboard/stores",
    icon: Store,
    separatorBefore: true,
  },
  {
    label: "Applications",
    href: "/admin/dashboard/applications",
    icon: ClipboardList,
  },
  {
    label: "Settings",
    href: "/admin/dashboard/settings",
    icon: Settings,
    separatorBefore: true,
  },
];

function SidebarLogo({ compact = false }: { compact?: boolean }) {
  const settings = useSiteSettings();
  const brandLabel = settings.logo_alt || settings.app_name;

  if (settings.logo_url) {
    return (
      <img
        src={settings.logo_url}
        alt={brandLabel}
        className={cn(
          "w-auto object-contain",
          compact ? "h-7 max-w-[120px]" : "h-8 max-w-[140px]",
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "font-bold tracking-tight text-primary",
        compact ? "text-sm" : "text-base",
      )}
    >
      {settings.app_name}
    </span>
  );
}

function SidebarBrand({
  collapsed,
  onToggle,
  allowToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
  allowToggle: boolean;
}) {
  const settings = useSiteSettings();
  const brandLabel = settings.logo_alt || settings.app_name;

  const content =
    collapsed && allowToggle ? (
      settings.favicon_url ? (
        <img
          src={settings.favicon_url}
          alt={brandLabel}
          className="h-7 w-7 object-contain"
        />
      ) : settings.logo_url ? (
        <img
          src={settings.logo_url}
          alt={brandLabel}
          className="h-7 w-7 object-contain"
        />
      ) : (
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
          {settings.app_name.slice(0, 2).toUpperCase()}
        </span>
      )
    ) : (
      <SidebarLogo />
    );

  if (!allowToggle) {
    return (
      <div className="flex h-full items-center px-4">{content}</div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "flex h-full w-full items-center transition hover:opacity-80",
        collapsed ? "justify-center px-2" : "justify-start px-4",
      )}
    >
      {content}
    </button>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, mobileOpen, toggleCollapsed, setMobileOpen } =
    useAdminLayout();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const handleLogout = async () => {
    const supabase = createAdminClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const showLabels = !collapsed || mobileOpen;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "flex flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-out",
          "fixed inset-y-0 left-0 z-50 w-[min(288px,88vw)] lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          mobileOpen || !collapsed ? "lg:w-60" : "lg:w-14",
        )}
      >
        <div
          className={cn(
            ADMIN_SHELL_HEADER_CLASS,
            "flex items-center border-b border-gray-200",
          )}
        >
          <button
            type="button"
            className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
          <div className="min-w-0 flex-1 lg:hidden">
            <SidebarBrand
              collapsed={false}
              onToggle={toggleCollapsed}
              allowToggle={false}
            />
          </div>
          <div className="hidden min-w-0 flex-1 lg:block">
            <SidebarBrand
              collapsed={collapsed}
              onToggle={toggleCollapsed}
              allowToggle
            />
          </div>
        </div>

        <nav className="scrollbar-hidden flex-1 overflow-y-auto px-2 py-3">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;

              return (
                <div key={item.href}>
                  {item.separatorBefore && showLabels ? (
                    <div className="my-2 border-t border-gray-100" />
                  ) : null}
                  {item.separatorBefore && !showLabels ? (
                    <div className="mx-2 my-2 border-t border-gray-100" />
                  ) : null}
                  <Link
                    href={item.href}
                    title={!showLabels ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center rounded-lg text-sm font-medium transition-colors",
                      showLabels
                        ? "gap-2.5 px-3 py-2.5"
                        : "justify-center px-2 py-2.5",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <Icon
                      size={17}
                      className={cn(
                        "shrink-0",
                        active ? "text-primary" : "text-gray-400",
                      )}
                    />
                    {showLabels ? <span>{item.label}</span> : null}
                  </Link>
                </div>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-gray-200 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleLogout}
            title={!showLabels ? "Logout" : undefined}
            className={cn(
              "flex w-full items-center rounded-lg text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900",
              showLabels ? "gap-2.5 px-3 py-2.5" : "justify-center px-2 py-2.5",
            )}
          >
            <LogOut size={17} />
            {showLabels ? <span>Logout</span> : null}
          </button>
        </div>
      </aside>
    </>
  );
}
