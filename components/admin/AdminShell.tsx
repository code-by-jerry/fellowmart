import Link from "next/link";

const navigation = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Collections", href: "/admin/collections" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Settings", href: "/admin/settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r bg-white p-6">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              FellowMart
            </p>
            <h2 className="text-xl font-semibold">Admin</h2>
          </div>
          <nav className="flex flex-col gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
