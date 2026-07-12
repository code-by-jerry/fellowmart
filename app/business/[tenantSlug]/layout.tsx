import type { Metadata } from "next";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { BusinessPortalSidebar } from "@/components/business/BusinessPortalSidebar";
import { AdminLayoutProvider } from "@/components/admin/AdminLayoutProvider";
import { requireTenantManager } from "@/lib/auth/business-access";
import { getTenantBySlug } from "@/lib/catalog/tenant-catalog";
import { buildMetadata } from "@/lib/site-config";
import { getSiteSettings } from "@/lib/site-config-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}): Promise<Metadata> {
  const { tenantSlug } = await params;
  const [platform, tenant] = await Promise.all([
    getSiteSettings(),
    getTenantBySlug(tenantSlug),
  ]);

  if (!tenant) return buildMetadata(platform);

  return buildMetadata(
    {
      ...platform,
      app_name: tenant.name || platform.app_name,
      favicon_url: tenant.favicon_url || platform.favicon_url,
    },
    { title: "Business dashboard" },
  );
}

export default async function BusinessTenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { tenant } = await requireTenantManager(tenantSlug);

  return (
    <AdminLayoutProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#f1f1f1]">
        <BusinessPortalSidebar tenantSlug={tenant.slug} />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <PortalTopbar mode="business" tenantName={tenant.name} tenantSlug={tenant.slug} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1200px] p-3 sm:p-4">{children}</div>
          </main>
        </div>
      </div>
    </AdminLayoutProvider>
  );
}
