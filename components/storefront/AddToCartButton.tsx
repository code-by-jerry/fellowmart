"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import styles from "@/app/home.module.css";
import { useStoreCommerce } from "@/components/storefront/StoreCommerceProvider";
import type { StoreProductRef } from "@/lib/storefront/commerce-types";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
  product: StoreProductRef;
  quantity?: number;
  className?: string;
  label?: string;
  openDrawer?: boolean;
};

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  label = "Add to cart",
  openDrawer = true,
}: AddToCartButtonProps) {
  const { addToCart } = useStoreCommerce();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={className ?? styles.addToCartBtn}
      disabled={added}
      onClick={() => {
        addToCart(product, quantity, { open: openDrawer });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      aria-label={added ? `${product.name} added` : `Add ${product.name} to cart`}
    >
      <ShoppingCart size={14} aria-hidden="true" />
      {added ? "Added" : label}
    </button>
  );
}

/** Compact PLP-style add button that accepts className from listing CSS. */
export function AddToCartButtonPlain({
  product,
  className,
  children,
}: {
  product: StoreProductRef;
  className?: string;
  children?: React.ReactNode;
}) {
  const { addToCart } = useStoreCommerce();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={cn(className)}
      disabled={added}
      onClick={() => {
        addToCart(product, 1, { open: true });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      aria-label={added ? `${product.name} added` : `Add ${product.name} to cart`}
    >
      {added ? "Added" : children ?? "Add to Cart"}
    </button>
  );
}
