"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Share2, ShoppingCart, Trash2, X } from "lucide-react";
import styles from "@/app/home.module.css";

type WishlistItem = {
  id: number;
  name: string;
  variant: string;
  price: number;
  originalPrice: number;
  rating: number;
  sprite: number;
};

const initialItems: WishlistItem[] = [
  { id: 1, name: "Apple iPhone 15", variant: "128GB · Black", price: 799, originalPrice: 899, rating: 4.7, sprite: 0 },
  { id: 2, name: "Samsung Galaxy S23", variant: "256GB · Green", price: 699, originalPrice: 849, rating: 4.6, sprite: 1 },
  { id: 3, name: "OnePlus 11R 5G", variant: "128GB · Graphite", price: 499, originalPrice: 599, rating: 4.5, sprite: 2 },
  { id: 4, name: "Noise Cancelling Headphones", variant: "Matte Black", price: 89, originalPrice: 129, rating: 4.8, sprite: 4 },
];

export function WishlistDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialItems);
  const closeButton = useRef<HTMLButtonElement>(null);
  const triggerButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerButton.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      trigger?.focus();
    };
  }, [open]);

  const removeItem = (id: number) => setItems((current) => current.filter((item) => item.id !== id));

  return <>
    <button ref={triggerButton} type="button" className={styles.headerWishlist} aria-label={`Open wishlist, ${items.length} items`} aria-expanded={open} aria-controls="store-wishlist-drawer" onClick={() => setOpen(true)}>
      <span className={styles.wishlistIconWrap}><Heart aria-hidden="true" /><b>{items.length}</b></span>
    </button>
    <div className={`${styles.wishlistDrawerLayer} ${open ? styles.wishlistDrawerOpen : ""}`} aria-hidden={!open}>
      <button className={styles.cartBackdrop} aria-label="Close wishlist" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} />
      <aside id="store-wishlist-drawer" className={styles.wishlistDrawer} role="dialog" aria-modal="true" aria-labelledby="wishlist-drawer-title">
        <header>
          <div>
            <span><Heart aria-hidden="true" /></span>
            <div><h2 id="wishlist-drawer-title">My Wishlist</h2><p>{items.length} saved for later</p></div>
          </div>
          <button ref={closeButton} onClick={() => setOpen(false)} aria-label="Close wishlist"><X /></button>
        </header>
        {items.length ? <>
          <div className={styles.wishlistToolbar}>
            <button type="button"><Share2 aria-hidden="true" /> Share</button>
            <button type="button"><ShoppingCart aria-hidden="true" /> Move all to cart</button>
          </div>
          <div className={styles.wishlistItems}>{items.map((item) => {
            const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
            return <article key={item.id} className={styles.wishlistItem}>
              <div className={styles.wishlistItemImage}><span style={{ "--item": item.sprite } as React.CSSProperties} /></div>
              <div className={styles.wishlistItemInfo}>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.variant}</p>
                  <small>{item.rating} ★★★★★</small>
                </div>
                <div className={styles.wishlistPrice}><strong>${item.price.toFixed(2)}</strong><s>${item.originalPrice.toFixed(2)}</s><em>{discount}% off</em></div>
                <div className={styles.wishlistActions}><button type="button"><ShoppingCart aria-hidden="true" /> Move to cart</button><button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}><Trash2 aria-hidden="true" /></button></div>
              </div>
            </article>;
          })}</div>
        </> : <div className={styles.emptyCart}><span><Heart /></span><h3>Your wishlist is empty</h3><p>Save your favorite finds and come back to them anytime.</p><button onClick={() => setOpen(false)}>Continue Shopping</button></div>}
      </aside>
    </div>
  </>;
}
