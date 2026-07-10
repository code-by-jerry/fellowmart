import Link from "next/link";
import { Check, ChevronRight, House, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import { ProductDetailHero } from "@/components/storefront/ProductDetailHero";
import { ProductDetailTabs } from "@/components/storefront/ProductDetailTabs";
import { ProductReviewsSection } from "@/components/storefront/ProductReviewsSection";
import {
  StoreProductCard,
  StoreProductCardGrid,
} from "@/components/storefront/StoreProductCard";
import { toStoreProductRef } from "@/lib/storefront/product-ref";
import type {
  StorefrontOption,
  StorefrontVariant,
} from "@/lib/storefront/resolve-variant";
import { getProductReviews } from "@/lib/storefront/product-reviews";
import {
  getTenantProductBySlug,
  getTenantProductDetail,
} from "@/lib/catalog/storefront-queries";
import {
  formatStorePrice,
  getStorefrontContext,
} from "@/lib/tenant/storefront-context";
import {
  categorySlugFromRelation,
  storeCategoriesPath,
  storeCategoryPath,
  storeProductPath,
} from "@/lib/storefront/store-links";
import { storePath } from "@/lib/routes/store-routes";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { notFound, redirect } from "next/navigation";
import styles from "@/app/categories/[category]/[product]/product.module.css";

type ProductOption = {
  id: string;
  name: string;
  position: number;
  product_option_values: Array<{
    id: string;
    value: string;
    position: number;
    swatch_color?: string | null;
    swatch_image_url?: string | null;
  }>;
};

type DbVariant = {
  id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price?: number | null;
  compare_at_price?: number | null;
  image_url?: string | null;
  stock_quantity?: number | null;
  is_active?: boolean;
};

type ProductAttribute = {
  attribute_key: string;
  attribute_value: string;
  group_name?: string | null;
};

export default async function StoreProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; category: string; product: string }>;
}) {
  const { slug: rawSlug, category, product: productSlug } = await params;
  const tenantSlug = normalizeTenantSlug(rawSlug);
  const storefront = await getStorefrontContext(tenantSlug);

  if (!storefront) {
    notFound();
  }

  let detail = await getTenantProductDetail(
    storefront.tenantId,
    category,
    productSlug,
  );

  if (!detail) {
    const resolved = await getTenantProductBySlug(
      storefront.tenantId,
      productSlug,
    );
    if (resolved?.category_slug) {
      redirect(
        storeProductPath(tenantSlug, resolved.slug, resolved.category_slug),
      );
    }
    notFound();
  }

  const { category: categoryRecord, product, options, variants, attributes, related } =
    detail;
  const base = storefront.basePath;
  const categoriesRoot = storeCategoriesPath(tenantSlug);
  const description =
    product.long_description ?? product.description ?? "No description available.";
  const specAttributes = (attributes as ProductAttribute[]).filter(
    (a) => a.group_name === "Specifications" || !a.group_name,
  );
  const storefrontOptions: StorefrontOption[] = (options as ProductOption[]).map(
    (option) => ({
      id: option.id,
      name: option.name,
      position: option.position,
      values: option.product_option_values.map((value) => ({
        id: value.id,
        value: value.value,
        position: value.position,
        swatch_color: value.swatch_color,
        swatch_image_url: value.swatch_image_url,
      })),
    }),
  );
  const storefrontVariants: StorefrontVariant[] = (variants as DbVariant[]).map(
    (variant) => ({
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      attributes: variant.attributes ?? {},
      price: variant.price,
      compare_at_price: variant.compare_at_price,
      image_url: variant.image_url,
      stock_quantity: variant.stock_quantity,
      is_active: variant.is_active,
    }),
  );
  const { summary: reviewSummary, reviews } = getProductReviews({
    productId: product.id,
    productSlug: product.slug,
    productImage: product.featured_image_url,
  });

  return (
    <TenantStoreLayout slug={tenantSlug} showCategoryNav={false}>
      <div className={styles.page}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href={base}>
            <House /> Home
          </Link>
          <ChevronRight />
          <Link href={categoriesRoot}>Categories</Link>
          <ChevronRight />
          <Link href={storeCategoryPath(tenantSlug, category)}>
            {categoryRecord.name}
          </Link>
          <ChevronRight />
          <span>{product.name}</span>
        </nav>

        <ProductDetailHero
          categorySlug={categoryRecord.slug}
          brandLabel={product.brand ?? storefront.tenantName}
          currency={storefront.currency}
          fxRate={storefront.fxRate}
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            subtitle: product.subtitle as string | null | undefined,
            description: product.description as string | null | undefined,
            price: Number(product.price),
            compare_at_price: product.compare_at_price
              ? Number(product.compare_at_price)
              : null,
            featured_image_url: product.featured_image_url as string | null,
          }}
          options={storefrontOptions}
          variants={storefrontVariants}
          reviewSummary={reviewSummary}
        />

        <ProductDetailTabs
          reviewCount={reviewSummary.total}
          description={
            <div className={styles.description}>
              <div>
                <h2>Product details</h2>
                <p>{description}</p>
                <ul>
                  <li>
                    <Check aria-hidden="true" /> Authentic products from verified sellers
                  </li>
                  <li>
                    <Check aria-hidden="true" /> Secure packaging and tracked delivery
                  </li>
                  <li>
                    <Check aria-hidden="true" /> Dedicated support for order help
                  </li>
                </ul>
              </div>
            </div>
          }
          specifications={
            <div className={styles.specPanel}>
              <h2>Specifications</h2>
              {specAttributes.length > 0 ? (
                <dl>
                  {specAttributes.map((attr) => (
                    <div key={`${attr.attribute_key}-${attr.attribute_value}`}>
                      <dt>{attr.attribute_key}</dt>
                      <dd>{attr.attribute_value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className={styles.specEmpty}>
                  Detailed specifications will be added soon.
                </p>
              )}
            </div>
          }
          reviews={
            <ProductReviewsSection
              productName={product.name}
              summary={reviewSummary}
              reviews={reviews}
            />
          }
          shipping={
            <div className={styles.shippingPanel}>
              <h2>Shipping &amp; returns</h2>
              <div className={styles.shippingGrid}>
                <article>
                  <Truck aria-hidden="true" />
                  <h3>Standard delivery</h3>
                  <p>3–5 business days. Free on orders above $49.</p>
                </article>
                <article>
                  <RotateCcw aria-hidden="true" />
                  <h3>Easy returns</h3>
                  <p>Return within 30 days if unused and in original packaging.</p>
                </article>
                <article>
                  <ShieldCheck aria-hidden="true" />
                  <h3>Secure checkout</h3>
                  <p>Payments are encrypted and processed through trusted gateways.</p>
                </article>
              </div>
            </div>
          }
        />

        {related.length > 0 ? (
          <section className={styles.relatedSection}>
            <div className={styles.sectionTitle}>
              <h2>You May Also Like</h2>
              <Link href={storeCategoryPath(tenantSlug, category)}>
                View all <ChevronRight />
              </Link>
            </div>
            <StoreProductCardGrid className={styles.relatedGrid}>
              {related.map((item, index) => {
                const relatedCategory =
                  categorySlugFromRelation(
                    item.categories as
                      | { slug?: string }
                      | { slug?: string }[]
                      | null
                      | undefined,
                  ) ?? category;

                return (
                <StoreProductCard
                  key={item.id}
                  product={toStoreProductRef({
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                    category_slug: relatedCategory,
                    featured_image_url: item.featured_image_url,
                    price: Number(item.price),
                    compare_at_price: item.compare_at_price,
                  })}
                  href={storeProductPath(tenantSlug, item.slug, relatedCategory)}
                  price={formatStorePrice(storefront, Number(item.price))}
                  imageUrl={item.featured_image_url}
                  imageIndex={index}
                  imageSizes="200px"
                  showAddToCart={false}
                />
              );
              })}
            </StoreProductCardGrid>
          </section>
        ) : null}
      </div>
    </TenantStoreLayout>
  );
}
