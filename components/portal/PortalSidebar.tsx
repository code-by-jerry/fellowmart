"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, X } from "lucide-react";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { useAdminLayout } from "@/components/admin/AdminLayoutProvider";
import { ADMIN_SHELL_HEADER_CLASS } from "@/components/admin/admin-ui";
import type { PortalNavItem } from "@/lib/navigation/portal-nav";
import { cn } from "@/lib/utils";

type PortalSidebarProps = {
  navItems: PortalNavItem[];
  logoutRedirect: string;
  onLogout?: () => Promise<void>;
};

function SidebarLogo({ compact = false }: { compact?: boolean }) {
  const settings = useSiteSettings();
  const brandLabel = settings.logo_alt || settings.app_name;

  // Collapsed: favicon only
  if (compact) {
    if (settings.favicon_url) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={settings.favicon_url}
          alt={brandLabel}
          className="h-8 w-8 object-contain"
        />
      );
    }

    if (settings.logo_url) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={settings.logo_url}
          alt={brandLabel}
          className="h-8 w-8 object-contain"
        />
      );
    }

    return (
      <span
        className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-900 text-[12px] font-bold text-white"
        aria-label={brandLabel}
      >
        {settings.app_name.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  // Expanded: full logo
  if (settings.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={settings.logo_url}
        alt={brandLabel}
        className="h-10 w-auto max-w-[168px] object-contain object-left"
      />
    );
  }

  if (settings.favicon_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={settings.favicon_url}
        alt={brandLabel}
        className="h-10 w-10 object-contain"
      />
    );
  }

  return (
    <span
      className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-900 text-[14px] font-bold text-white"
      aria-label={brandLabel}
    >
      {settings.app_name.slice(0, 1).toUpperCase()}
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
  const content = <SidebarLogo compact={collapsed && allowToggle} />;

  if (!allowToggle) {
    return <div className="flex h-full items-center px-3">{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(
        "flex h-full w-full items-center transition hover:opacity-80",
        collapsed ? "justify-center px-2" : "justify-start px-3",
      )}
    >
      {content}
    </button>
  );
}

const navItemBase =
  "relative flex items-center text-[13px] font-medium transition-colors";

export function PortalSidebar({
  navItems,
  logoutRedirect,
  onLogout,
}: PortalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, mobileOpen, toggleCollapsed, setMobileOpen } =
    useAdminLayout();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
    router.replace(logoutRedirect);
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const showLabels = !collapsed || mobileOpen;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "flex flex-col border-r border-gray-200 bg-white transition-[width,transform] duration-200 ease-out",
          "fixed inset-y-0 left-0 z-50 w-[min(240px,88vw)] lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          mobileOpen || !collapsed ? "lg:w-[220px]" : "lg:w-12",
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
            className="ml-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={16} />
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

        <nav className="scrollbar-hidden flex-1 overflow-y-auto px-2 py-2">
          <div className="space-y-px">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;

              const itemClass = cn(
                navItemBase,
                showLabels ? "gap-2 px-2.5 py-1.5" : "justify-center px-1.5 py-1.5",
                active
                  ? "rounded-md bg-[#f1f1f1] text-gray-900"
                  : "rounded-md text-gray-600 hover:bg-[#f6f6f6] hover:text-gray-900",
              );

              const iconEl = (
                <Icon
                  size={16}
                  strokeWidth={1.75}
                  className={cn(
                    "shrink-0",
                    active ? "text-gray-800" : "text-gray-400",
                  )}
                />
              );

              if (item.external) {
                return (
                  <div key={item.href}>
                    {item.separatorBefore && showLabels ? (
                      <div className="my-1.5 border-t border-gray-100" />
                    ) : null}
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      title={!showLabels ? item.label : undefined}
                      className={itemClass}
                    >
                      {active && showLabels ? (
                        <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-gray-800" />
                      ) : null}
                      {iconEl}
                      {showLabels ? <span>{item.label}</span> : null}
                    </a>
                  </div>
                );
              }

              return (
                <div key={item.href}>
                  {item.separatorBefore && showLabels ? (
                    <div className="my-1.5 border-t border-gray-100" />
                  ) : null}
                  {item.separatorBefore && !showLabels ? (
                    <div className="mx-1.5 my-1.5 border-t border-gray-100" />
                  ) : null}
                  <Link
                    href={item.href}
                    title={!showLabels ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={itemClass}
                  >
                    {active && showLabels ? (
                      <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-gray-800" />
                    ) : null}
                    {iconEl}
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
              navItemBase,
              "w-full text-gray-500 hover:bg-[#f6f6f6] hover:text-gray-900",
              showLabels
                ? "gap-2 rounded-md px-2.5 py-1.5"
                : "justify-center rounded-md px-1.5 py-1.5",
            )}
          >
            <LogOut size={16} strokeWidth={1.75} />
            {showLabels ? <span>Logout</span> : null}
          </button>
        </div>
      </aside>
    </>
  );
}
