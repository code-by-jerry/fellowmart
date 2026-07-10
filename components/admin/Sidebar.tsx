"use client";

import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { platformNavItems } from "@/lib/navigation/platform-nav";
import { createAdminClient } from "@/utils/supabase/admin-client";

export default function PlatformSidebar() {
  const handleLogout = async () => {
    const supabase = createAdminClient();
    await supabase.auth.signOut();
  };

  return (
    <PortalSidebar
      navItems={platformNavItems}
      logoutRedirect="/admin/login"
      onLogout={handleLogout}
    />
  );
}
