import Link from "next/link";
import {
  ArrowRight,
  Mail,
  Zap,
} from "lucide-react";
import type { StorefrontContext } from "@/lib/tenant/storefront-context";
import { formatStorePrice } from "@/lib/tenant/storefront-context";
import type { StorefrontHeroBanner } from "@/lib/catalog/hero-banner-service";
import { storePath } from "@/lib/routes/store-routes";
import {
  storeCategoriesPath,
  storeCollectionPath,
  storeCollectionsPath,
  storeProductPath,
} from "@/lib/storefront/store-links";
import { discountLabel } from "@/lib/catalog/storefront-queries";
import { toStoreProductRef } from "@/lib/storefront/product-ref";
import {
  StoreProductCard,
  StoreProductCardGrid,
} from "@/components/storefront/StoreProductCard";
import { HeroSlider } from "@/components/storefront/HeroSlider";
import styles from "@/app/home.module.css";

const fallbackPromos = [
  {
    name: "New Season Picks",
    slug: "new-season",
    description: "Fresh arrivals for everyday style",
    cta: "Shop collection",
  },
  {
    name: "Home Essentials",
    slug: "home-essentials",
    description: "Upgrade your space with curated finds",
    cta: "Explore now",
  },
  {
    name: "Tech Deals",
    slug: "tech-deals",
    description: "Gadgets and accessories on promo",
    cta: "View deals",
  },
];

const fallbackFeatured = [
  {
    id: "fallback:urban-voyager-backpack",
    name: "Urban Voyager Backpack",
    slug: "urban-voyager-backpack",
    price: 49.99,
    compare_at_price: null as number | null,
    featured_image_url: null as string | null,
    category_slug: "accessories",
    ratingCount: 120,
  },
  {
    id: "fallback:classic-leather-watch",
    name: "Classic Leather Watch",
    slug: "classic-leather-watch",
    price: 149,
    compare_at_price: null,
    featured_image_url: null,
    category_slug: "accessories",
    ratingCount: 86,
  },
  {
    id: "fallback:daily-hydrating-cleanser",
    name: "Daily Hydrating Cleanser",
    slug: "daily-hydrating-cleanser",
    price: 19.99,
    compare_at_price: null,
    featured_image_url: null,
    category_slug: "beauty-care",
    ratingCount: 57,
  },
  {
    id: "fallback:minimal-white-sneakers",
    name: "Minimal White Sneakers",
    slug: "minimal-white-sneakers",
    price: 69,
    compare_at_price: null,
    featured_image_url: null,
    category_slug: "footwear",
    ratingCount: 210,
  },
  {
    id: "fallback:premium-wireless-headphones",
    name: "Premium Wireless Headphones",
    slug: "premium-wireless-headphones",
    price: 89,
    compare_at_price: 119,
    featured_image_url: null,
    category_slug: "electronics",
    ratingCount: 98,
  },
  {
    id: "fallback:minimal-ceramic-vase",
    name: "Minimal Ceramic Vase",
    slug: "minimal-ceramic-vase",
    price: 24.99,
    compare_at_price: null,
    featured_image_url: null,
    category_slug: "home-living",
    ratingCount: 43,
  },
];

const fallbackFlashDeals = [
  {
    id: "fallback:wireless-earbuds",
    name: "Wireless Earbuds",
    slug: "wireless-earbuds",
    price: 34.99,
    compare_at_price: 49.99,
    featured_image_url: null as string | null,
    category_slug: "electronics",
  },
  {
    id: "fallback:luxury-perfume",
    name: "Luxury Perfume",
    slug: "luxury-perfume",
    price: 59.99,
    compare_at_price: 79.99,
    featured_image_url: null,
    category_slug: "beauty-care",
  },
  {
    id: "fallback:cotton-basic-tshirt",
    name: "Cotton Basic T-Shirt",
    slug: "cotton-basic-tshirt",
    price: 15.99,
    compare_at_price: 19.99,
    featured_image_url: null,
    category_slug: "fashion",
  },
  {
    id: "fallback:nonstick-casserole",
    name: "Non-stick Casserole",
    slug: "nonstick-casserole",
    price: 32.49,
    compare_at_price: 49.99,
    featured_image_url: null,
    category_slug: "home-living",
  },
  {
    id: "fallback:led-desk-lamp",
    name: "LED Desk Lamp",
    slug: "led-desk-lamp",
    price: 29.99,
    compare_at_price: 39.99,
    featured_image_url: null,
    category_slug: "home-living",
  },
  {
    id: "fallback:travel-duffle-bag",
    name: "Travel Duffle Bag",
    slug: "travel-duffle-bag",
    price: 41.99,
    compare_at_price: 59.99,
    featured_image_url: null,
    category_slug: "accessories",
  },
];

const fallbackBrandNames = [
  "APPLE",
  "SAMSUNG",
  "NIKE",
  "adidas",
  "SONY",
  "boAt",
  "PHILIPS",
  "dyson",
];

type FeaturedProduct = {
  id?: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number | null;
  featured_image_url?: string | null;
  category_slug?: string | null;
  ratingCount?: number;
};

function productHref(
  tenantSlug: string,
  categorySlug: string | null | undefined,
  productSlug: string,
) {
  return storeProductPath(tenantSlug, productSlug, categorySlug);
}

export function StoreHomeContent({
  storefront,
  banners = [],
  collections: dbCollections = [],
  featuredProducts: dbFeatured = [],
  dealProducts: dbDeals = [],
  brands: dbBrands = [],
}: {
  storefront: StorefrontContext;
  banners?: StorefrontHeroBanner[];
  collections?: Array<{
    name: string;
    slug: string;
    description?: string | null;
    image_url?: string | null;
  }>;
  featuredProducts?: FeaturedProduct[];
  dealProducts?: Array<{
    id?: string;
    name: string;
    slug: string;
    price: number;
    compare_at_price?: number | null;
    featured_image_url?: string | null;
    category_slug?: string | null;
  }>;
  brands?: Array<{ id: string; name: string; slug: string; logo_url?: string | null }>;
}) {
  const { settings, tenantSlug } = storefront;
  const categoriesHref = storeCategoriesPath(tenantSlug);
  const collectionsHref = storeCollectionsPath(tenantSlug);

  const promoCollections =
    dbCollections.length > 0
      ? dbCollections.slice(0, 6).map((c, index) => ({
          name: c.name,
          slug: c.slug,
          description: c.description ?? "Shop curated picks from this collection",
          cta: index === 0 ? "Shop now" : "Explore",
          image_url: c.image_url ?? null,
          href: storeCollectionPath(tenantSlug, c.slug),
        }))
      : fallbackPromos.map((p) => ({
          ...p,
          image_url: null as string | null,
          href: categoriesHref,
        }));

  const brandItems =
    dbBrands.length > 0
      ? dbBrands.map((brand) => ({
          name: brand.name.toUpperCase(),
          href: categoriesHref,
          key: brand.id,
        }))
      : fallbackBrandNames.map((name) => ({
          name,
          href: categoriesHref,
          key: name,
        }));

  const featuredProducts: FeaturedProduct[] =
    dbFeatured.length > 0 ? dbFeatured : fallbackFeatured;

  const money = (amount: number) => formatStorePrice(storefront, amount);

  const flashDeals =
    dbDeals.length > 0 ? dbDeals : fallbackFlashDeals;

  return (
    <>
      <HeroSlider
        banners={banners}
        fallback={{
          eyebrow: settings.home_hero_eyebrow,
          title: settings.home_hero_title,
          description: settings.home_hero_description,
          href: categoriesHref,
          imageSrc: "/images/fellowmate-hero.png",
        }}
      />

      <div className={styles.finalContent}>
        <section className={styles.marketSection} aria-labelledby="promo-collections-title">
          <div className={styles.sectionHeading}>
            <h2 id="promo-collections-title">Promo Collections</h2>
            <Link href={collectionsHref}>
              View all collections <ArrowRight />
            </Link>
          </div>
          <div className={styles.promoCollectionGrid}>
            {promoCollections.map((promo, index) => (
              <Link
                key={promo.slug}
                href={promo.href}
                className={`${styles.promoBanner} ${styles[`promoTone${(index % 3) + 1}`]}`}
              >
                <span
                  className={styles.promoBannerMedia}
                  style={
                    promo.image_url
                      ? {
                          backgroundImage: `url(${promo.image_url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : ({ "--item": index % 6 } as React.CSSProperties)
                  }
                  aria-hidden="true"
                />
                <div className={styles.promoBannerCopy}>
                  <small>Collection</small>
                  <h3>{promo.name}</h3>
                  <p>{promo.description}</p>
                  <span className={styles.promoBannerCta}>
                    {promo.cta} <ArrowRight aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.marketSection}>
          <div className={styles.sectionHeading}>
            <h2>Featured Products</h2>
            <Link href={categoriesHref}>
              View all products <ArrowRight />
            </Link>
          </div>
          <StoreProductCardGrid columns={6}>
            {featuredProducts.map((product, index) => {
              const href = productHref(
                tenantSlug,
                product.category_slug,
                product.slug,
              );
              const price = Number(product.price);
              const compare = product.compare_at_price
                ? Number(product.compare_at_price)
                : null;

              return (
                <StoreProductCard
                  key={product.slug}
                  product={toStoreProductRef({
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    category_slug: product.category_slug,
                    featured_image_url: product.featured_image_url,
                    price,
                    compare_at_price: compare,
                  })}
                  href={href}
                  price={money(price)}
                  comparePrice={
                    compare && compare > price ? money(compare) : null
                  }
                  imageUrl={product.featured_image_url}
                  imageIndex={index}
                  ratingCount={product.ratingCount}
                />
              );
            })}
          </StoreProductCardGrid>
        </section>

        <section className={styles.saleBanner}>
          <div className={styles.saleIcon}>
            <Zap />
          </div>
          <div>
            <strong>Weekend Mega Sale</strong>
            <h2>UP TO 40% OFF</h2>
            <p>Limited time offer on selected items</p>
          </div>
          <div className={styles.saleDecor}>
            <span />
            <span />
            <span />
          </div>
          <Link href={collectionsHref}>
            Shop Now <ArrowRight />
          </Link>
        </section>

        <section className={styles.marketSection}>
          <div className={`${styles.sectionHeading} ${styles.flashHeading}`}>
            <div>
              <Zap />
              <span>
                <h2>Flash Sale</h2>
                <small>Hurry up! Limited time deals</small>
              </span>
            </div>
            <div className={styles.countdown}>
              <small>Ends in</small>
              <b>
                02<span>Hours</span>
              </b>
              <b>
                15<span>Mins</span>
              </b>
              <b>
                30<span>Secs</span>
              </b>
            </div>
            <Link href={collectionsHref}>
              View all deals <ArrowRight />
            </Link>
          </div>
          <StoreProductCardGrid columns={6}>
            {flashDeals.map((deal, index) => {
              const price = Number(deal.price);
              const compare = deal.compare_at_price
                ? Number(deal.compare_at_price)
                : null;
              const discount = discountLabel(price, compare);
              const href = productHref(
                tenantSlug,
                deal.category_slug,
                deal.slug,
              );

              return (
                <StoreProductCard
                  key={deal.slug}
                  product={toStoreProductRef({
                    id: deal.id,
                    name: deal.name,
                    slug: deal.slug,
                    category_slug: deal.category_slug,
                    featured_image_url: deal.featured_image_url,
                    price,
                    compare_at_price: compare,
                  })}
                  href={href}
                  price={money(price)}
                  comparePrice={
                    compare && compare > price ? money(compare) : null
                  }
                  badge={discount}
                  imageUrl={deal.featured_image_url}
                  imageIndex={index}
                />
              );
            })}
          </StoreProductCardGrid>
        </section>

        <section className={styles.finalSection} id="brands">
          <div className={styles.sectionHeading}>
            <h2>Popular Brands</h2>
            <Link href={categoriesHref}>
              View all brands <ArrowRight />
            </Link>
          </div>
          <div className={styles.finalBrands}>
            {brandItems.map((brand) => (
              <Link href={brand.href} key={brand.key}>
                {brand.name}
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.lifestyleBanner}>
          <div>
            <h2>
              Make Your Space
              <br />
              More Beautiful
            </h2>
            <p>
              Discover premium products for every
              <br />
              corner of your home.
            </p>
            <Link href={collectionsHref}>
              Explore Collection <ArrowRight />
            </Link>
          </div>
          <div className={styles.roomPlaceholder} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </section>

        <section className={styles.newsletter}>
          <div>
            <span>
              <Mail />
            </span>
            <p>
              <strong>Stay Updated!</strong>
              <small>
                Subscribe to our newsletter and get 10% off your first order.
              </small>
            </p>
          </div>
          <form>
            <input
              type="email"
              aria-label="Email address"
              placeholder="Enter your email address"
            />
            <button type="button">Subscribe</button>
          </form>
        </section>
      </div>
    </>
  );
}
