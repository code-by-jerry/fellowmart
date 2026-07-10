"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useStoreCommerce } from "@/components/storefront/StoreCommerceProvider";
import type { StoreProductRef } from "@/lib/storefront/commerce-types";
import { storePath } from "@/lib/routes/store-routes";
import styles from "@/app/categories/[category]/[product]/product.module.css";

export function ProductPurchasePanel({
  product,
  inStock = true,
}: {
  product: StoreProductRef;
  inStock?: boolean;
}) {
  const router = useRouter();
  const { addToCart, tenantSlug } = useStoreCommerce();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = (open = true) => {
    addToCart(product, quantity, { open });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <>
      <div className={styles.purchaseRow}>
        <div className={styles.quantity}>
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus />
          </button>
          <span>{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
          >
            <Plus />
          </button>
        </div>
        <button
          type="button"
          className={styles.cartButton}
          disabled={added || !inStock}
          onClick={() => handleAdd(true)}
        >
          <ShoppingCart /> {added ? "Added" : inStock ? "Add to Cart" : "Out of stock"}
        </button>
        <button
          type="button"
          className={styles.buyButton}
          disabled={!inStock}
          onClick={() => {
            handleAdd(false);
            router.push(storePath(tenantSlug, "cart"));
          }}
        >
          Buy Now
        </button>
      </div>
      <p className={styles.stock}>
        <Check /> {inStock ? "In stock — ready to ship" : "Currently out of stock"}
      </p>
    </>
  );
}
