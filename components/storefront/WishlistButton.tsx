"use client";

import { Heart } from "lucide-react";
import styles from "@/app/home.module.css";
import { useStoreCommerce } from "@/components/storefront/StoreCommerceProvider";
import type { StoreProductRef } from "@/lib/storefront/commerce-types";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  product: StoreProductRef;
  className?: string;
  /** When true, uses home.module.css wishlistBtn styles */
  variant?: "overlay" | "plain";
};

export function WishlistButton({
  product,
  className,
  variant = "overlay",
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useStoreCommerce();
  const active = isInWishlist(product.productId);

  return (
    <button
      type="button"
      className={cn(
        variant === "overlay" && styles.wishlistBtn,
        active && styles.wishlistBtnActive,
        className,
      )}
      aria-pressed={active}
      aria-label={
        active ? `Remove ${product.name} from wishlist` : `Save ${product.name}`
      }
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleWishlist(product);
      }}
    >
      <Heart
        aria-hidden="true"
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
