import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { BusinessPortalSidebar } from "@/components/business/BusinessPortalSidebar";
import { AdminLayoutProvider } from "@/components/admin/AdminLayoutProvider";
import { requireTenantManager } from "@/lib/auth/business-access";

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
