import Link from "next/link";

export function StorefrontShell({
  tenant,
  children,
}: {
  tenant: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              FellowMart
            </p>
            <h1 className="text-xl font-semibold">{tenant}</h1>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href={`/${tenant}`} className="hover:text-primary">
              Home
            </Link>
            <Link href={`/${tenant}/products`} className="hover:text-primary">
              Products
            </Link>
            <Link href={`/${tenant}/cart`} className="hover:text-primary">
              Cart
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
