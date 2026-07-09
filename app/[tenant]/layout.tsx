import { StorefrontShell } from "@/components/storefront/StorefrontShell";
import { getTenantFromParams } from "@/lib/utils/tenant";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant?: string | string[] }>;
}) {
  const tenant = getTenantFromParams(await params);

  return <StorefrontShell tenant={tenant}>{children}</StorefrontShell>;
}
