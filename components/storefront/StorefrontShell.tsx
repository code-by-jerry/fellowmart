import Link from "next/link";
import { storePath } from "@/lib/routes/store-routes";

type StoreTenant = {
  name: string;
  slug?: string;
};

export function StorefrontShell({
  tenant,
  slug,
  children,
}: {
  tenant: StoreTenant | string;
  slug?: string;
  children: React.ReactNode;
}) {
  const storeSlug =
    slug ??
    (typeof tenant === "string" ? tenant : (tenant.slug ?? ""));
  const storeName =
    typeof tenant === "string" ? tenant : tenant.name;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              FellowMart Store
            </p>
            <h1 className="text-xl font-semibold">{storeName}</h1>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href={storePath(storeSlug)} className="hover:text-primary">
              Home
            </Link>
            <Link
              href={storePath(storeSlug, "products")}
              className="hover:text-primary"
            >
              Products
            </Link>
            <Link href={storePath(storeSlug, "cart")} className="hover:text-primary">
              Cart
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
