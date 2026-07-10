"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { discountLabel, formatStorePrice } from "@/lib/storefront/pricing";
import { ProductPurchasePanel } from "@/components/storefront/ProductPurchasePanel";
import { ProductRatingBadge } from "@/components/storefront/ProductReviewsSection";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import { toStoreProductRef } from "@/lib/storefront/product-ref";
import {
  buildProductGalleryImages,
  initialVariantSelection,
  resolveVariant,
  variantLabel,
  type StorefrontOption,
  type StorefrontVariant,
} from "@/lib/storefront/resolve-variant";
import type { StoreCurrencyCode } from "@/lib/currency/currencies";
import styles from "@/app/categories/[category]/[product]/product.module.css";

type ProductDetailHeroProps = {
  categorySlug: string;
  brandLabel: string;
  currency: StoreCurrencyCode;
  fxRate: number;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    subtitle?: string | null;
    description?: string | null;
    price: number;
    compare_at_price?: number | null;
    featured_image_url?: string | null;
  };
  options: StorefrontOption[];
  variants: StorefrontVariant[];
  reviewSummary: {
    average: number;
    total: number;
  };
};

function isColorOption(option: StorefrontOption): boolean {
  if (/color|colour/i.test(option.name)) return true;
  return option.values.some(
    (value) => value.swatch_color || value.swatch_image_url,
  );
}

export function ProductDetailHero({
  categorySlug,
  brandLabel,
  currency,
  fxRate,
  product,
  options,
  variants,
  reviewSummary,
}: ProductDetailHeroProps) {
  const storefront = { currency, fxRate };
  const normalizedOptions = useMemo(
    () =>
      [...options]
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((option) => ({
          ...option,
          values: [...option.values].sort(
            (a, b) => (a.position ?? 0) - (b.position ?? 0),
          ),
        })),
    [options],
  );

  const [selected, setSelected] = useState<Record<string, string>>(() =>
    initialVariantSelection(normalizedOptions, variants),
  );
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  const galleryImages = useMemo(
    () => buildProductGalleryImages(product.featured_image_url, variants),
    [product.featured_image_url, variants],
  );

  const activeVariant = useMemo(
    () => resolveVariant(variants, selected),
    [variants, selected],
  );

  const displayPrice = Number(activeVariant?.price ?? product.price) || 0;
  const displayCompare = activeVariant?.compare_at_price ?? product.compare_at_price;
  const compare = displayCompare ? Number(displayCompare) : null;
  const activeDiscount =
    compare && compare > displayPrice
      ? discountLabel(displayPrice, compare)
      : null;

  const resolvedImageUrl =
    activeVariant?.image_url ?? product.featured_image_url ?? galleryImages[0] ?? null;

  useEffect(() => {
    if (activeVariant?.image_url) {
      setActiveImageUrl(activeVariant.image_url);
      return;
    }
    if (!activeImageUrl && resolvedImageUrl) {
      setActiveImageUrl(resolvedImageUrl);
    }
  }, [activeVariant?.image_url, activeImageUrl, resolvedImageUrl]);

  const mainImageUrl = activeImageUrl ?? resolvedImageUrl;

  const productRef = toStoreProductRef({
    id: product.id,
    variantId: activeVariant?.id ?? null,
    name: product.name,
    slug: product.slug,
    category_slug: categorySlug,
    featured_image_url: mainImageUrl,
    price: displayPrice,
    compare_at_price: compare,
    variantLabel: activeVariant
      ? variantLabel(activeVariant.attributes)
      : null,
  });

  const displaySku = activeVariant?.sku ?? product.sku;
  const stockQty = activeVariant?.stock_quantity;
  const inStock = stockQty == null || stockQty > 0;

  const selectOption = (optionName: string, value: string) => {
    setSelected((current) => ({ ...current, [optionName]: value }));
  };

  return (
    <section className={styles.productHero}>
      <div
        className={`${styles.gallery} ${
          galleryImages.length <= 1 ? styles.gallerySingle : ""
        }`}
      >
        {galleryImages.length > 1 ? (
          <div className={styles.thumbnails}>
            {galleryImages.map((url, index) => (
              <button
                type="button"
                key={url}
                className={mainImageUrl === url ? styles.activeThumb : ""}
                aria-label={`View product image ${index + 1}`}
                aria-current={mainImageUrl === url}
                onClick={() => setActiveImageUrl(url)}
              >
                <Image src={url} alt="" width={72} height={72} />
              </button>
            ))}
          </div>
        ) : null}
        <div className={styles.mainImage}>
          {mainImageUrl ? (
            <Image
              src={mainImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <span />
          )}
          <WishlistButton product={productRef} variant="plain" />
        </div>
      </div>

      <div className={styles.productInfo}>
        <p className={styles.brand}>{brandLabel.toUpperCase()}</p>
        <h1>{product.name}</h1>
        {product.subtitle ? (
          <p className={styles.summary}>{product.subtitle}</p>
        ) : null}

        <div className={styles.ratingRow}>
          <ProductRatingBadge
            average={reviewSummary.average}
            total={reviewSummary.total}
          />
          <span className={styles.sku}>SKU: {displaySku}</span>
        </div>

        <div className={styles.price}>
          <strong>{formatStorePrice(storefront, displayPrice)}</strong>
          {compare && compare > displayPrice ? (
            <>
              <del>{formatStorePrice(storefront, compare)}</del>
              {activeDiscount ? <em>{activeDiscount}</em> : null}
            </>
          ) : null}
        </div>
        <p className={styles.tax}>
          Inclusive of all taxes · Free delivery on qualifying orders
        </p>

        {product.description ? (
          <p className={styles.lead}>{product.description}</p>
        ) : null}

        {normalizedOptions.map((option) => {
          const selectedValue = selected[option.name];
          const colorStyle = isColorOption(option);

          return (
            <fieldset className={styles.option} key={option.id}>
              <legend>
                {option.name}
                {selectedValue ? (
                  <>
                    : <strong>{selectedValue}</strong>
                  </>
                ) : null}
              </legend>
              {colorStyle ? (
                <div className={styles.colors}>
                  {option.values.map((value) => (
                    <button
                      type="button"
                      key={value.id}
                      className={
                        selectedValue === value.value ? styles.selectedColor : ""
                      }
                      aria-label={value.value}
                      aria-pressed={selectedValue === value.value}
                      onClick={() => selectOption(option.name, value.value)}
                      style={
                        value.swatch_image_url
                          ? {
                              backgroundImage: `url(${value.swatch_image_url})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : value.swatch_color
                            ? { backgroundColor: value.swatch_color }
                            : undefined
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.storage}>
                  {option.values.map((value) => (
                    <button
                      type="button"
                      key={value.id}
                      className={
                        selectedValue === value.value ? styles.selectedOption : ""
                      }
                      aria-pressed={selectedValue === value.value}
                      onClick={() => selectOption(option.name, value.value)}
                    >
                      {value.value}
                    </button>
                  ))}
                </div>
              )}
            </fieldset>
          );
        })}

        <ProductPurchasePanel product={productRef} inStock={inStock} />

        <div className={styles.assurances}>
          <div>
            <Truck />
            <p>
              <strong>Free Delivery</strong>
              <span>On orders above $49</span>
            </p>
          </div>
          <div>
            <RotateCcw />
            <p>
              <strong>Easy Returns</strong>
              <span>30-day return policy</span>
            </p>
          </div>
          <div>
            <ShieldCheck />
            <p>
              <strong>Secure Payment</strong>
              <span>Protected checkout</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
