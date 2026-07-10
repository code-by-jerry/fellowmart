import Link from "next/link";
import {
  Download,
  Ellipsis,
  LayoutGrid,
  Truck,
} from "lucide-react";
import styles from "@/app/home.module.css";
import { StoreHeader } from "./StoreHeader";
import { StoreCommerceProvider } from "./StoreCommerceProvider";
import { getSiteSettings } from "@/lib/site-config-server";
import type { SiteSettings } from "@/lib/site-config";
import { getCategoryIcon } from "@/lib/catalog/category-display";
import type { StorefrontCategory } from "@/lib/catalog/category-display";
import type { FooterPageLink } from "@/lib/catalog/store-page-service";
import type { StorefrontContext } from "@/lib/tenant/storefront-context";
import { storePath } from "@/lib/routes/store-routes";
import {
  storeCategoriesPath,
  storeCollectionsPath,
  storeSearchPath,
} from "@/lib/storefront/store-links";
import { themeCssVars } from "@/lib/utils/color";

export type CustomerStoreLayoutProps = {
  children: React.ReactNode;
  userName?: string | null;
  showPrimaryNav?: boolean;
  showCategoryNav?: boolean;
  showFooter?: boolean;
  /** When set, all links and branding are scoped to this tenant store. */
  storefront?: StorefrontContext;
  categories?: StorefrontCategory[];
  footerPages?: FooterPageLink[];
};

function Brand({
  settings,
  homeHref,
}: {
  settings: SiteSettings;
  homeHref: string;
}) {
  return (
    <Link href={homeHref} className={styles.brand} aria-label={`${settings.app_name} home`}>
      {settings.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={settings.logo_url} alt={settings.logo_alt} className={styles.siteLogo} />
      ) : (
        <span className={styles.mark}>FM</span>
      )}
    </Link>
  );
}

export function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  const promoParts = settings.announcement_promo.split(/(WELCOME10)/i);
  return (
    <div className={styles.utilityBar}>
      <div className={styles.utilityInner}>
        <p className={styles.utilityMessage}>
          <Truck aria-hidden="true" />
          <span>{settings.announcement_text}</span>
        </p>
        <p className={styles.welcomeOffer} aria-hidden="true">
          {promoParts.map((part, index) =>
            part.toUpperCase() === "WELCOME10" ? (
              <strong key={index}>{part}</strong>
            ) : (
              <span key={index}>{part}</span>
            ),
          )}
        </p>
        <nav aria-label="Utility navigation">
          <Link href="#">
            <Download aria-hidden="true" /> Download App
          </Link>
          <span />
          <Link href="#">Track Order</Link>
          <span />
          <Link href="#">Help &amp; FAQs</Link>
        </nav>
      </div>
    </div>
  );
}

export function StoreCategoryNavigation({
  categories,
  basePath,
}: {
  categories: StorefrontCategory[];
  basePath: string;
}) {
  const navCategories = categories.slice(0, 8);
  const categoriesRoot = `${basePath}/categories`;

  return (
    <section className={styles.categoryStrip} aria-label="Product categories">
      <div className={styles.categories}>
        <Link href={categoriesRoot} className={styles.category}>
          <span className={styles.activeCategory}>
            <LayoutGrid aria-hidden="true" />
          </span>
          <strong>All</strong>
        </Link>
        {navCategories.map((category) => {
          const Icon = getCategoryIcon(category.icon_name);
          return (
            <Link
              href={`${basePath}/categories/${category.slug}`}
              key={category.id}
              className={styles.category}
            >
              <span>
                <Icon aria-hidden="true" />
              </span>
              <strong>{category.name}</strong>
            </Link>
          );
        })}
        {categories.length > 8 && (
          <Link href={categoriesRoot} className={styles.category}>
            <span>
              <Ellipsis aria-hidden="true" />
            </span>
            <strong>More</strong>
          </Link>
        )}
      </div>
    </section>
  );
}

export function StoreFooter({
  settings,
  homeHref,
  blogHref,
  footerPages = [],
  tenantSlug,
}: {
  settings: SiteSettings;
  homeHref: string;
  blogHref?: string;
  footerPages?: FooterPageLink[];
  tenantSlug?: string | null;
}) {
  const companyPages = footerPages.filter((p) => p.footer_group === "company");
  const helpPages = footerPages.filter((p) => p.footer_group === "help");
  const storefrontSlug =
    tenantSlug ?? settings.marketplace_tenant_slug ?? "fellowmart";

  const columns = [
    {
      title: "Shop",
      links: [
        { label: "Products", href: storeCategoriesPath(storefrontSlug) },
        { label: "Categories", href: storeCategoriesPath(storefrontSlug) },
        { label: "Collections", href: storeCollectionsPath(storefrontSlug) },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Blog", href: blogHref ?? `${homeHref}/blog` },
        ...companyPages.map((page) => ({
          label: page.title,
          href: `${homeHref}/pages/${page.slug}`,
        })),
      ],
    },
    {
      title: "Help",
      links:
        helpPages.length > 0
          ? helpPages.map((page) => ({
              label: page.title,
              href: `${homeHref}/pages/${page.slug}`,
            }))
          : [
              {
                label: "Contact us",
                href: `${homeHref}/pages/contact-us`,
              },
            ],
    },
  ];

  return (
    <footer className={styles.finalFooter}>
      <div className={styles.footerGrid}>
        <div className={styles.footerBrand}>
          <Brand settings={settings} homeHref={homeHref} />
          <p>{settings.footer_description}</p>
          <div>
            <Link href="#" aria-label="Facebook">
              f
            </Link>
            <Link href="#" aria-label="Instagram">
              ◎
            </Link>
            <Link href="#" aria-label="Twitter">
              𝕏
            </Link>
          </div>
        </div>
        {columns.map((column) => (
          <div className={styles.footerColumn} key={column.title}>
            <h3>{column.title}</h3>
            {column.links.map((link) => (
              <Link href={link.href} key={`${column.title}-${link.label}`}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.footerBottom}>
        <span>
          © {new Date().getFullYear()} {settings.app_name}. All rights reserved.
        </span>
        <p>VISA &nbsp; ●● &nbsp; PayPal &nbsp;  Pay &nbsp; G Pay</p>
      </div>
    </footer>
  );
}

export async function CustomerStoreLayout({
  children,
  userName,
  showCategoryNav = false,
  showFooter = true,
  storefront,
  categories = [],
  footerPages = [],
}: CustomerStoreLayoutProps) {
  const settings = storefront?.settings ?? (await getSiteSettings());
  const homeHref = storefront?.basePath ?? "/";
  const profileHref = storefront
    ? storePath(storefront.tenantSlug, "profile")
    : "/profile";
  const loginHref = storefront
    ? `/login?next=${encodeURIComponent(storefront.basePath)}`
    : "/login";
  const searchHref = storefront
    ? storeSearchPath(storefront.tenantSlug)
    : storeSearchPath(settings.marketplace_tenant_slug);
  const categoryList = showCategoryNav ? categories : [];
  const themeStyle = storefront
    ? themeCssVars(storefront.themeColor)
    : themeCssVars(settings.theme_color);

  const shell = (
    <div className={styles.page} style={themeStyle}>
      <AnnouncementBar settings={settings} />
      <StoreHeader
        userName={userName}
        settings={settings}
        homeHref={homeHref}
        searchHref={searchHref}
        profileHref={profileHref}
        loginHref={loginHref}
      />
      {showCategoryNav && categoryList.length > 0 && (
        <StoreCategoryNavigation
          categories={categoryList}
          basePath={storefront?.basePath ?? storePath(settings.marketplace_tenant_slug)}
        />
      )}
      <main>{children}</main>
      {showFooter && (
        <StoreFooter
          settings={settings}
          homeHref={homeHref}
          tenantSlug={storefront?.tenantSlug}
          blogHref={
            storefront
              ? storePath(storefront.tenantSlug, "blog")
              : `${homeHref}/blog`
          }
          footerPages={footerPages}
        />
      )}
    </div>
  );

  if (!storefront) {
    return shell;
  }

  return (
    <StoreCommerceProvider
      config={{
        tenantId: storefront.tenantId,
        tenantSlug: storefront.tenantSlug,
        currency: storefront.currency,
        fxRate: storefront.fxRate,
      }}
    >
      {shell}
    </StoreCommerceProvider>
  );
}
