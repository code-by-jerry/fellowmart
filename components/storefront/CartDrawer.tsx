"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import styles from "@/app/home.module.css";

type CartItem = { id: number; name: string; variant: string; price: number; quantity: number; sprite: number };

const initialItems: CartItem[] = [
  { id: 1, name: "Urban Voyager Backpack", variant: "Midnight Black", price: 49.99, quantity: 1, sprite: 0 },
  { id: 2, name: "Classic Leather Watch", variant: "Black / 42mm", price: 149, quantity: 1, sprite: 1 },
];

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialItems);
  const closeButton = useRef<HTMLButtonElement>(null);
  const triggerButton = useRef<HTMLButtonElement>(null);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

  const changeQuantity = (id: number, delta: number) => setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const removeItem = (id: number) => setItems((current) => current.filter((item) => item.id !== id));

  return <>
    <button ref={triggerButton} type="button" className={styles.cart} aria-label={`Open cart, ${itemCount} items`} aria-expanded={open} aria-controls="store-cart-drawer" onClick={() => setOpen(true)}>
      <span className={styles.bagWrap}><ShoppingBag aria-hidden="true" /><b>{itemCount}</b></span>
    </button>
    <div className={`${styles.cartDrawerLayer} ${open ? styles.cartDrawerOpen : ""}`} aria-hidden={!open}>
      <button className={styles.cartBackdrop} aria-label="Close cart" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} />
      <aside id="store-cart-drawer" className={styles.cartDrawer} role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <header><div><h2 id="cart-drawer-title">Your Cart</h2><span>{itemCount} {itemCount === 1 ? "item" : "items"}</span></div><button ref={closeButton} onClick={() => setOpen(false)} aria-label="Close cart"><X /></button></header>
        {items.length ? <>
          <div className={styles.cartItems}>{items.map((item) => <article key={item.id} className={styles.cartItem}>
            <div className={styles.cartItemImage}><span style={{ "--item": item.sprite } as React.CSSProperties} /></div>
            <div className={styles.cartItemInfo}><div><h3>{item.name}</h3><p>{item.variant}</p></div><strong>${(item.price * item.quantity).toFixed(2)}</strong><div className={styles.cartItemActions}><div><button aria-label={`Decrease ${item.name} quantity`} onClick={() => changeQuantity(item.id, -1)}><Minus /></button><span>{item.quantity}</span><button aria-label={`Increase ${item.name} quantity`} onClick={() => changeQuantity(item.id, 1)}><Plus /></button></div><button aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.id)}><Trash2 /> Remove</button></div></div>
          </article>)}</div>
          <footer><div className={styles.cartProgress}><p><strong>You qualify for free delivery!</strong><span>Order total is above $49.</span></p><i><span /></i></div><div className={styles.cartTotals}><p><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></p><small>Shipping and taxes calculated at checkout.</small></div><Link href="#" className={styles.checkoutButton}>Proceed to Checkout</Link><button className={styles.continueButton} onClick={() => setOpen(false)}>Continue Shopping</button></footer>
        </> : <div className={styles.emptyCart}><span><ShoppingBag /></span><h3>Your cart is empty</h3><p>Looks like you haven’t added anything yet.</p><button onClick={() => setOpen(false)}>Start Shopping</button></div>}
      </aside>
    </div>
  </>;
}
