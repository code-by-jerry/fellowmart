import type { LucideIcon } from "lucide-react";

export type PortalNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  separatorBefore?: boolean;
  external?: boolean;
};
