"use client";

import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { getBusinessNavItems } from "@/lib/navigation/business-nav";
import { createClient } from "@/utils/supabase/client";

type BusinessPortalSidebarProps = {
  tenantSlug: string;
};

export function BusinessPortalSidebar({
  tenantSlug,
}: BusinessPortalSidebarProps) {
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return (
    <PortalSidebar
      navItems={getBusinessNavItems(tenantSlug)}
      logoutRedirect="/business/login"
      onLogout={handleLogout}
    />
  );
}
