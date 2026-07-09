import Link from "next/link";
import {
  ChevronDown,
  Download,
  Ellipsis,
  LayoutGrid,
  Search,
  Truck,
  UserRound,
} from "lucide-react";
import styles from "@/app/home.module.css";
import { CartDrawer } from "./CartDrawer";
import { WishlistDrawer } from "./WishlistDrawer";
import { getSiteSettings } from "@/lib/site-config-server";
import type { SiteSettings } from "@/lib/site-config";
import { getCategoryIcon } from "@/lib/catalog/category-display";
import { getMarketplaceCategories } from "@/lib/catalog/marketplace-catalog";

export type CustomerStoreLayoutProps = {
  children: React.ReactNode;
  userName?: string | null;
  showPrimaryNav?: boolean;
  showCategoryNav?: boolean;
  showFooter?: boolean;
};

function Brand({ settings }: { settings: SiteSettings }) {
  return <Link href="/" className={styles.brand} aria-label={`${settings.app_name} home`}>{settings.logo_url ? <img src={settings.logo_url} alt={settings.logo_alt} className={styles.siteLogo} /> : <span className={styles.mark}>FM</span>}</Link>;
}

export function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  const promoParts = settings.announcement_promo.split(/(WELCOME10)/i);
  return <div className={styles.utilityBar}><div className={styles.utilityInner}><p><Truck aria-hidden="true" /> {settings.announcement_text}</p><p className={styles.welcomeOffer}>{promoParts.map((part, index) => part.toUpperCase() === "WELCOME10" ? <strong key={index}>{part}</strong> : part)}</p><nav aria-label="Utility navigation"><Link href="#"><Download aria-hidden="true" /> Download App</Link><span /><Link href="#">Track Order</Link><span /><Link href="#">Help &amp; FAQs</Link></nav></div></div>;
}

export function StoreHeader({ userName, settings }: { userName?: string | null; settings: SiteSettings }) {
  return <header className={styles.header}>
    <div className={styles.headerInner}>
      <Brand settings={settings} />
      <form className={styles.search} role="search"><button type="button" className={styles.searchCategory}>All Categories <ChevronDown aria-hidden="true" /></button><label className={styles.searchInput}><span className="sr-only">Search products</span><input placeholder="Search for products, brands and more..." /></label><button type="submit" className={styles.searchButton} aria-label="Search"><Search aria-hidden="true" /></button></form>
      <div className={styles.accountActions}><Link href={userName ? "/profile" : "/login"} className={styles.account} aria-label="User Profile">{userName ? <div className={styles.userAvatar}>{userName.charAt(0).toUpperCase()}</div> : <UserRound aria-hidden="true" />}</Link><WishlistDrawer /><CartDrawer /></div>
    </div>
    <div className={styles.mobileSearch}><Search aria-hidden="true" /><input placeholder="Search products, brands and more..." aria-label="Search products" /></div>
  </header>;
}

export function StoreCategoryNavigation({
  categories,
}: {
  categories: Awaited<ReturnType<typeof getMarketplaceCategories>>;
}) {
  const navCategories = categories.slice(0, 8);

  return (
    <section className={styles.categoryStrip} aria-label="Product categories">
      <div className={styles.categories}>
        <Link href="/categories" className={styles.category}>
          <span className={styles.activeCategory}>
            <LayoutGrid aria-hidden="true" />
          </span>
          <strong>All Categories</strong>
        </Link>
        {navCategories.map((category) => {
          const Icon = getCategoryIcon(category.icon_name);
          return (
            <Link
              href={`/categories/${category.slug}`}
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
          <Link href="/categories" className={styles.category}>
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

export function StoreFooter({ settings }: { settings: SiteSettings }) {
  const columns = [{ title: "Shop", links: ["All Categories", "New Arrivals", "Best Sellers", "Deals", "Collections"] }, { title: "Customer Service", links: ["Contact Us", "FAQs", "Shipping & Delivery", "Returns & Refunds", "Track Order"] }, { title: "Company", links: ["About Us", "Careers", "Privacy Policy", "Terms & Conditions", "Blog"] }, { title: "Help", links: ["My Account", "Order History", "Wishlist", "Support Center"] }];
  return <footer className={styles.finalFooter}><div className={styles.footerGrid}><div className={styles.footerBrand}><Brand settings={settings} /><p>{settings.footer_description}</p><div><Link href="#" aria-label="Facebook">f</Link><Link href="#" aria-label="Instagram">◎</Link><Link href="#" aria-label="Twitter">𝕏</Link></div></div>{columns.map((column) => <div className={styles.footerColumn} key={column.title}><h3>{column.title}</h3>{column.links.map((link) => <Link href="#" key={link}>{link}</Link>)}</div>)}</div><div className={styles.footerBottom}><span>© {new Date().getFullYear()} {settings.app_name}. All rights reserved.</span><p>VISA &nbsp; ●● &nbsp; PayPal &nbsp;  Pay &nbsp; G Pay</p></div></footer>;
}

export async function CustomerStoreLayout({ children, userName, showPrimaryNav = true, showCategoryNav = false, showFooter = true }: CustomerStoreLayoutProps) {
  const settings = await getSiteSettings();
  const categories = showCategoryNav ? await getMarketplaceCategories() : [];
  return <div className={styles.page}><AnnouncementBar settings={settings} /><StoreHeader userName={userName} settings={settings} />{showCategoryNav && <StoreCategoryNavigation categories={categories} />}<main>{children}</main>{showFooter && <StoreFooter settings={settings} />}</div>;
}
