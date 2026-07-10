import {
  CreditCard,
  FileText,
  FolderTree,
  History,
  ImageIcon,
  LayoutDashboard,
  Layers,
  Newspaper,
  Package,
  Settings,
  ShoppingCart,
  ExternalLink,
  Tag,
  Users,
} from "lucide-react";
import type { PortalNavItem } from "@/lib/navigation/portal-nav";
import { storePath } from "@/lib/routes/store-routes";

export function getBusinessNavItems(tenantSlug: string): PortalNavItem[] {
  const base = `/business/${tenantSlug}`;

  return [
    {
      label: "Dashboard",
      href: base,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Subscription",
      href: `${base}/subscription`,
      icon: CreditCard,
      separatorBefore: true,
    },
    {
      label: "Categories",
      href: `${base}/categories`,
      icon: FolderTree,
    },
    {
      label: "Collections",
      href: `${base}/collections`,
      icon: Layers,
    },
    {
      label: "Brands",
      href: `${base}/brands`,
      icon: Tag,
    },
    {
      label: "Products",
      href: `${base}/products`,
      icon: Package,
    },
    {
      label: "Banners",
      href: `${base}/banners`,
      icon: ImageIcon,
    },
    {
      label: "Blog",
      href: `${base}/blog`,
      icon: Newspaper,
    },
    {
      label: "Pages",
      href: `${base}/pages`,
      icon: FileText,
    },
    {
      label: "Orders",
      href: `${base}/orders`,
      icon: ShoppingCart,
      separatorBefore: true,
    },
    {
      label: "Customers",
      href: `${base}/customers`,
      icon: Users,
    },
    {
      label: "Payments",
      href: `${base}/payments`,
      icon: CreditCard,
    },
    {
      label: "Storefront",
      href: storePath(tenantSlug),
      icon: ExternalLink,
      external: true,
      separatorBefore: true,
    },
    {
      label: "Activity",
      href: `${base}/activity`,
      icon: History,
      separatorBefore: true,
    },
    {
      label: "Settings",
      href: `${base}/settings`,
      icon: Settings,
    },
  ];
}
