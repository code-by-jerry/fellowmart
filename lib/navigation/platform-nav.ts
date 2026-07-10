import {
  ClipboardList,
  CreditCard,
  History,
  LayoutDashboard,
  Settings,
  Store,
  Users,
} from "lucide-react";
import type { PortalNavItem } from "@/lib/navigation/portal-nav";

export const platformNavItems: PortalNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Businesses",
    href: "/admin/dashboard/stores",
    icon: Store,
    separatorBefore: true,
  },
  {
    label: "Applications",
    href: "/admin/dashboard/applications",
    icon: ClipboardList,
  },
  {
    label: "Subscription Plans",
    href: "/admin/dashboard/subscription-plans",
    icon: CreditCard,
  },
  {
    label: "Customers",
    href: "/admin/dashboard/customers",
    icon: Users,
    separatorBefore: true,
  },
  {
    label: "Activity",
    href: "/admin/dashboard/activity",
    icon: History,
    separatorBefore: true,
  },
  {
    label: "Settings",
    href: "/admin/dashboard/settings",
    icon: Settings,
  },
];
