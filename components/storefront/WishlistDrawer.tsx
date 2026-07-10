"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, X } from "lucide-react";
import styles from "@/app/home.module.css";
import { useStoreCommerceOptional } from "@/components/storefront/StoreCommerceProvider";
import { storePath } from "@/lib/routes/store-routes";

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
        sizes="92px"
        style={{ objectFit: "cover" }}
      />
    );
  }
  return <span style={{ "--item": index % 6 } as React.CSSProperties} />;
}

export function WishlistDrawer() {
  const commerce = useStoreCommerceOptional();
  const closeButton = useRef<HTMLButtonElement>(null);
  const triggerButton = useRef<HTMLButtonElement>(null);

  const wishlistOpen = commerce?.wishlistOpen ?? false;
  const closeWishlist = commerce?.closeWishlist ?? (() => undefined);
  const openWishlist = commerce?.openWishlist ?? (() => undefined);
  const wishlistCount = commerce?.wishlistCount ?? 0;
  const wishlistItems = commerce?.wishlistItems ?? [];
  const formatPrice = commerce?.formatPrice ?? ((n: number) => `₹${n}`);
  const removeFromWishlist = commerce?.removeFromWishlist ?? (() => undefined);
  const moveWishlistToCart = commerce?.moveWishlistToCart ?? (() => undefined);
  const moveAllWishlistToCart = commerce?.moveAllWishlistToCart ?? (() => undefined);
  const tenantSlug = commerce?.tenantSlug ?? "fellowmart";

  useEffect(() => {
    if (!wishlistOpen) return;
    const trigger = triggerButton.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeWishlist();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      trigger?.focus();
    };
  }, [wishlistOpen, closeWishlist]);

  if (!commerce) {
    return (
      <button
        type="button"
        className={styles.headerWishlist}
        aria-label="Wishlist unavailable"
        disabled
      >
        <span className={styles.wishlistIconWrap}>
          <Heart aria-hidden="true" />
        </span>
      </button>
    );
  }

  return (
    <>
      <button
        ref={triggerButton}
        type="button"
        className={styles.headerWishlist}
        aria-label={`Open wishlist, ${wishlistCount} items`}
        aria-expanded={wishlistOpen}
        aria-controls="store-wishlist-drawer"
        onClick={openWishlist}
      >
        <span className={styles.wishlistIconWrap}>
          <Heart aria-hidden="true" />
          {wishlistCount > 0 ? <b>{wishlistCount}</b> : null}
        </span>
      </button>

      <div
        className={`${styles.wishlistDrawerLayer} ${wishlistOpen ? styles.wishlistDrawerOpen : ""}`}
        aria-hidden={!wishlistOpen}
      >
        <button
          className={styles.cartBackdrop}
          aria-label="Close wishlist"
          onClick={closeWishlist}
          tabIndex={wishlistOpen ? 0 : -1}
        />
        <aside
          id="store-wishlist-drawer"
          className={styles.wishlistDrawer}
          role="dialog"
          aria-modal="true"
          aria-labelledby="wishlist-drawer-title"
        >
          <header>
            <div>
              <span>
                <Heart aria-hidden="true" />
              </span>
              <div>
                <h2 id="wishlist-drawer-title">My Wishlist</h2>
                <p>
                  {wishlistCount} saved for later
                </p>
              </div>
            </div>
            <button
              ref={closeButton}
              onClick={closeWishlist}
              aria-label="Close wishlist"
            >
              <X />
            </button>
          </header>

          {wishlistItems.length ? (
            <>
              <div className={styles.wishlistToolbar}>
                <button
                  type="button"
                  onClick={moveAllWishlistToCart}
                >
                  <ShoppingCart aria-hidden="true" /> Move all to cart
                </button>
              </div>
              <div className={styles.wishlistItems}>
                {wishlistItems.map((item, index) => {
                  const compare = item.compareAtPriceInr;
                  const discount =
                    compare && compare > item.priceInr
                      ? Math.round(((compare - item.priceInr) / compare) * 100)
                      : 0;
                  const href = storePath(
                    tenantSlug,
                    `categories/${item.categorySlug || "all"}/${item.slug}`,
                  );

                  return (
                    <article key={item.productId} className={styles.wishlistItem}>
                      <Link
                        href={href}
                        className={styles.wishlistItemImage}
                        onClick={closeWishlist}
                      >
                        <LineImage
                          name={item.name}
                          imageUrl={item.imageUrl}
                          index={index}
                        />
                      </Link>
                      <div className={styles.wishlistItemInfo}>
                        <div>
                          <h3>
                            <Link href={href} onClick={closeWishlist}>
                              {item.name}
                            </Link>
                          </h3>
                          {item.variantLabel ? <p>{item.variantLabel}</p> : null}
                        </div>
                        <div className={styles.wishlistPrice}>
                          <strong>{formatPrice(item.priceInr)}</strong>
                          {compare && compare > item.priceInr ? (
                            <>
                              <s>{formatPrice(compare)}</s>
                              {discount > 0 ? <em>{discount}% off</em> : null}
                            </>
                          ) : null}
                        </div>
                        <div className={styles.wishlistActions}>
                          <button
                            type="button"
                            onClick={() => moveWishlistToCart(item.productId)}
                          >
                            <ShoppingCart aria-hidden="true" /> Move to cart
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromWishlist(item.productId)}
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className={styles.emptyCart}>
              <span>
                <Heart />
              </span>
              <h3>Your wishlist is empty</h3>
              <p>Save your favorite finds and come back to them anytime.</p>
              <button type="button" onClick={closeWishlist}>
                Continue Shopping
              </button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
