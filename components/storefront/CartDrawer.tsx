"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import styles from "@/app/home.module.css";
import { useStoreCommerceOptional } from "@/components/storefront/StoreCommerceProvider";
import { storePath } from "@/lib/routes/store-routes";
import { storeCheckoutPath } from "@/lib/storefront/store-links";
import { cartLineKey } from "@/lib/storefront/resolve-variant";

function LineImage({
  name,
  imageUrl,
  index,
}: {
  name: string;
  imageUrl?: string | null;
  index: number;
}) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        fill
        sizes="96px"
        style={{ objectFit: "cover" }}
      />
    );
  }
  return <span style={{ "--item": index % 6 } as React.CSSProperties} />;
}

export function CartDrawer() {
  const commerce = useStoreCommerceOptional();
  const closeButton = useRef<HTMLButtonElement>(null);
  const triggerButton = useRef<HTMLButtonElement>(null);

  const cartOpen = commerce?.cartOpen ?? false;
  const closeCart = commerce?.closeCart ?? (() => undefined);
  const openCart = commerce?.openCart ?? (() => undefined);
  const cartCount = commerce?.cartCount ?? 0;
  const cartItems = commerce?.cartItems ?? [];
  const cartSubtotalInr = commerce?.cartSubtotalInr ?? 0;
  const formatPrice = commerce?.formatPrice ?? ((n: number) => `₹${n}`);
  const changeCartQuantity = commerce?.changeCartQuantity ?? (() => undefined);
  const removeFromCart = commerce?.removeFromCart ?? (() => undefined);
  const tenantSlug = commerce?.tenantSlug ?? "fellowmart";
  const checkoutHref = storeCheckoutPath(tenantSlug);

  useEffect(() => {
    if (!cartOpen) return;
    const trigger = triggerButton.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      trigger?.focus();
    };
  }, [cartOpen, closeCart]);

  if (!commerce) {
    return (
      <button type="button" className={styles.cart} aria-label="Cart unavailable" disabled>
        <span className={styles.bagWrap}>
          <ShoppingBag aria-hidden="true" />
        </span>
      </button>
    );
  }

  return (
    <>
      <button
        ref={triggerButton}
        type="button"
        className={styles.cart}
        aria-label={`Open cart, ${cartCount} items`}
        aria-expanded={cartOpen}
        aria-controls="store-cart-drawer"
        onClick={openCart}
      >
        <span className={styles.bagWrap}>
          <ShoppingBag aria-hidden="true" />
          {cartCount > 0 ? <b>{cartCount}</b> : null}
        </span>
      </button>

      <div
        className={`${styles.cartDrawerLayer} ${cartOpen ? styles.cartDrawerOpen : ""}`}
        aria-hidden={!cartOpen}
      >
        <button
          className={styles.cartBackdrop}
          aria-label="Close cart"
          onClick={closeCart}
          tabIndex={cartOpen ? 0 : -1}
        />
        <aside
          id="store-cart-drawer"
          className={styles.cartDrawer}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
        >
          <header>
            <div>
              <h2 id="cart-drawer-title">Your Cart</h2>
              <span>
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              ref={closeButton}
              onClick={closeCart}
              aria-label="Close cart"
            >
              <X />
            </button>
          </header>

          {cartItems.length ? (
            <>
              <div className={styles.cartItems}>
                {cartItems.map((item, index) => {
                  const href = storePath(
                    tenantSlug,
                    `categories/${item.categorySlug || "all"}/${item.slug}`,
                  );
                  const lineKey = cartLineKey(item.productId, item.variantId);
                  return (
                    <article key={lineKey} className={styles.cartItem}>
                      <Link href={href} className={styles.cartItemImage} onClick={closeCart}>
                        <LineImage
                          name={item.name}
                          imageUrl={item.imageUrl}
                          index={index}
                        />
                      </Link>
                      <div className={styles.cartItemInfo}>
                        <div>
                          <h3>
                            <Link href={href} onClick={closeCart}>
                              {item.name}
                            </Link>
                          </h3>
                          {item.variantLabel ? <p>{item.variantLabel}</p> : null}
                        </div>
                        <strong>
                          {formatPrice(item.priceInr * item.quantity)}
                        </strong>
                        <div className={styles.cartItemActions}>
                          <div>
                            <button
                              type="button"
                              aria-label={`Decrease ${item.name} quantity`}
                              onClick={() => changeCartQuantity(lineKey, -1)}
                            >
                              <Minus />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              aria-label={`Increase ${item.name} quantity`}
                              onClick={() => changeCartQuantity(lineKey, 1)}
                            >
                              <Plus />
                            </button>
                          </div>
                          <button
                            type="button"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => removeFromCart(lineKey)}
                          >
                            <Trash2 /> Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <footer>
                <div className={styles.cartProgress}>
                  <p>
                    <strong>Ready when you are</strong>
                    <span>Review items and continue to checkout.</span>
                  </p>
                  <i>
                    <span style={{ width: "100%" }} />
                  </i>
                </div>
                <div className={styles.cartTotals}>
                  <p>
                    <span>Subtotal</span>
                    <strong>{formatPrice(cartSubtotalInr)}</strong>
                  </p>
                  <small>Shipping and taxes calculated at checkout.</small>
                </div>
                <Link
                  href={checkoutHref}
                  className={styles.checkoutButton}
                  onClick={closeCart}
                >
                  Proceed to Checkout
                </Link>
                <button
                  type="button"
                  className={styles.continueButton}
                  onClick={closeCart}
                >
                  Continue Shopping
                </button>
              </footer>
            </>
          ) : (
            <div className={styles.emptyCart}>
              <span>
                <ShoppingBag />
              </span>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven&apos;t added anything yet.</p>
              <button type="button" onClick={closeCart}>
                Start Shopping
    </button>
            </div>
          )}
      </aside>
    </div>
    </>
  );
}
