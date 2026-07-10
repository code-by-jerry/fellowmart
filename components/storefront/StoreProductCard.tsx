"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AddToCartButton } from "@/components/storefront/AddToCartButton";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import type { StoreProductRef } from "@/lib/storefront/commerce-types";
import { cn } from "@/lib/utils";
import styles from "@/components/storefront/product-card.module.css";

export type StoreProductCardProps = {
  product: StoreProductRef;
  href: string;
  price: string;
  comparePrice?: string | null;
  discount?: string | null;
  imageUrl?: string | null;
  imageIndex?: number;
  imageSizes?: string;
  brand?: string | null;
  ratingCount?: number;
  badge?: string | null;
  showAddToCart?: boolean;
  className?: string;
};

function StarRating({ count }: { count?: number }) {
  return (
    <p className={styles.rating}>
      <span aria-hidden="true">★★★★★</span>
      <small>({count ?? "—"})</small>
    </p>
  );
}

export function StoreProductCard({
  product,
  href,
  price,
  comparePrice,
  discount,
  imageUrl,
  imageIndex = 0,
  imageSizes = "(max-width: 760px) 50vw, 200px",
  brand,
  ratingCount,
  badge,
  showAddToCart = true,
  className,
}: StoreProductCardProps) {
  return (
    <article className={cn(styles.card, className)}>
      <div className={styles.media}>
        <Link href={href} className={styles.imageLink}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes={imageSizes}
              className={styles.image}
            />
          ) : (
            <span
              className={styles.sprite}
              style={{ "--item": imageIndex % 6 } as React.CSSProperties}
              aria-hidden="true"
            />
          )}
        </Link>
        {badge ? <b className={styles.badge}>{badge}</b> : null}
        <WishlistButton
          product={product}
          variant="plain"
          className={styles.wishlist}
        />
      </div>
      <div className={styles.body}>
        <Link href={href} className={styles.title}>
          {product.name}
        </Link>
        {brand ? <p className={styles.brand}>{brand}</p> : null}
        {ratingCount != null ? <StarRating count={ratingCount} /> : null}
        <div className={styles.priceRow}>
          <strong className={styles.price}>{price}</strong>
          {comparePrice ? (
            <del className={styles.compare}>{comparePrice}</del>
          ) : null}
          {discount ? <em className={styles.discount}>{discount}</em> : null}
        </div>
        {showAddToCart ? (
          <AddToCartButton
            product={product}
            className={styles.addButton}
          />
        ) : null}
      </div>
    </article>
  );
}

type StoreProductCardGridProps = {
  children: ReactNode;
  columns?: 4 | 6;
  className?: string;
  "aria-label"?: string;
};

export function StoreProductCardGrid({
  children,
  columns = 4,
  className,
  "aria-label": ariaLabel,
}: StoreProductCardGridProps) {
  return (
    <section
      className={cn(
        columns === 6 ? styles.gridSix : styles.grid,
        className,
      )}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
}
