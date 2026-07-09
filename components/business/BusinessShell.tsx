"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  Package,
  Settings,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/products", icon: Package },
  { label: "Storefront", href: "/storefront", icon: ExternalLink, external: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function BusinessShell({
  tenantSlug,
  tenantName,
  children,
}: {
  tenantSlug: string;
  tenantName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/business/${tenantSlug}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
              Business Admin
            </p>
            <h1 className="truncate text-base font-semibold text-gray-900">{tenantName}</h1>
          </div>
          <Link
            href="/business"
            className="hidden text-sm text-gray-500 hover:text-primary sm:inline"
          >
            All businesses
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-2 lg:sticky lg:top-5">
          <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((item) => {
              const href = item.href ? `${base}${item.href}` : base;
              const active = item.exact
                ? pathname === href
                : pathname === href || pathname.startsWith(`${href}/`);

              if (item.external) {
                return (
                  <a
                    key={item.label}
                    href={`/${tenantSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <item.icon size={16} />
                    {item.label}
                  </a>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}

export function BusinessStatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}
