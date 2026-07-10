"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { formatMoney } from "@/lib/currency/format";
import type {
  CartLineItem,
  StoreCommerceConfig,
  StoreProductRef,
  WishlistItem,
} from "@/lib/storefront/commerce-types";

type StoreCommerceContextValue = {
  tenantSlug: string;
  cartItems: CartLineItem[];
  wishlistItems: WishlistItem[];
  cartCount: number;
  wishlistCount: number;
  cartSubtotalInr: number;
  cartOpen: boolean;
  wishlistOpen: boolean;
  hydrated: boolean;
  formatPrice: (amountInr: number) => string;
  openCart: () => void;
  closeCart: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  addToCart: (product: StoreProductRef, quantity?: number, opts?: { open?: boolean }) => void;
  setCartQuantity: (lineKey: string, quantity: number) => void;
  changeCartQuantity: (lineKey: string, delta: number) => void;
  removeFromCart: (lineKey: string) => void;
  clearCart: () => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: StoreProductRef) => void;
  removeFromWishlist: (productId: string) => void;
  moveWishlistToCart: (productId: string) => void;
  moveAllWishlistToCart: () => void;
};

const StoreCommerceContext = createContext<StoreCommerceContextValue | null>(
  null,
);

function storageKey(tenantId: string, kind: "cart" | "wishlist") {
  return `fm:${kind}:${tenantId}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}

function normalizeProduct(product: StoreProductRef): StoreProductRef {
  return {
    productId: product.productId,
    variantId: product.variantId ?? null,
    name: product.name,
    slug: product.slug,
    categorySlug: product.categorySlug ?? null,
    imageUrl: product.imageUrl ?? null,
    priceInr: Number(product.priceInr) || 0,
    compareAtPriceInr:
      product.compareAtPriceInr != null
        ? Number(product.compareAtPriceInr)
        : null,
    variantLabel: product.variantLabel ?? null,
  };
}

export function StoreCommerceProvider({
  config,
  children,
}: {
  config: StoreCommerceConfig;
  children: ReactNode;
}) {
  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCartItems(readJson<CartLineItem[]>(storageKey(config.tenantId, "cart"), []));
    setWishlistItems(
      readJson<WishlistItem[]>(storageKey(config.tenantId, "wishlist"), []),
    );
    setHydrated(true);
  }, [config.tenantId]);

  useEffect(() => {
    if (!hydrated) return;
    writeJson(storageKey(config.tenantId, "cart"), cartItems);
  }, [cartItems, config.tenantId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writeJson(storageKey(config.tenantId, "wishlist"), wishlistItems);
  }, [wishlistItems, config.tenantId, hydrated]);

  const formatPrice = useCallback(
    (amountInr: number) =>
      formatMoney(amountInr, {
        currency: config.currency,
        rate: config.fxRate,
        convert: true,
      }),
    [config.currency, config.fxRate],
  );

  const addToCart = useCallback(
    (product: StoreProductRef, quantity = 1, opts?: { open?: boolean }) => {
      const qty = Math.max(1, Math.floor(quantity) || 1);
      const next = normalizeProduct(product);
      const lineKey = next.variantId
        ? `${next.productId}:${next.variantId}`
        : next.productId;
      setCartItems((current) => {
        const existing = current.find((item) => {
          const itemKey = item.variantId
            ? `${item.productId}:${item.variantId}`
            : item.productId;
          return itemKey === lineKey;
        });
        if (existing) {
          return current.map((item) => {
            const itemKey = item.variantId
              ? `${item.productId}:${item.variantId}`
              : item.productId;
            return itemKey === lineKey
              ? { ...item, ...next, quantity: item.quantity + qty }
              : item;
          });
        }
        return [
          ...current,
          { ...next, quantity: qty, addedAt: new Date().toISOString() },
        ];
      });
      if (opts?.open !== false) {
        setWishlistOpen(false);
        setCartOpen(true);
      }
    },
    [],
  );

  const setCartQuantity = useCallback((lineKey: string, quantity: number) => {
    const qty = Math.floor(quantity);
    setCartItems((current) => {
      if (qty <= 0) {
        return current.filter((item) => {
          const itemKey = item.variantId
            ? `${item.productId}:${item.variantId}`
            : item.productId;
          return itemKey !== lineKey;
        });
      }
      return current.map((item) => {
        const itemKey = item.variantId
          ? `${item.productId}:${item.variantId}`
          : item.productId;
        return itemKey === lineKey ? { ...item, quantity: qty } : item;
      });
    });
  }, []);

  const changeCartQuantity = useCallback((lineKey: string, delta: number) => {
    setCartItems((current) =>
      current
        .map((item) => {
          const itemKey = item.variantId
            ? `${item.productId}:${item.variantId}`
            : item.productId;
          return itemKey === lineKey
            ? { ...item, quantity: item.quantity + delta }
            : item;
        })
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((lineKey: string) => {
    setCartItems((current) =>
      current.filter((item) => {
        const itemKey = item.variantId
          ? `${item.productId}:${item.variantId}`
          : item.productId;
        return itemKey !== lineKey;
      }),
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const isInWishlist = useCallback(
    (productId: string) =>
      wishlistItems.some((item) => item.productId === productId),
    [wishlistItems],
  );

  const toggleWishlist = useCallback((product: StoreProductRef) => {
    const next = normalizeProduct(product);
    setWishlistItems((current) => {
      const exists = current.some((item) => item.productId === next.productId);
      if (exists) {
        return current.filter((item) => item.productId !== next.productId);
      }
      return [
        ...current,
        { ...next, savedAt: new Date().toISOString() },
      ];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlistItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }, []);

  const moveWishlistToCart = useCallback(
    (productId: string) => {
      setWishlistItems((current) => {
        const item = current.find((entry) => entry.productId === productId);
        if (item) {
          addToCart(item, 1, { open: true });
        }
        return current.filter((entry) => entry.productId !== productId);
      });
    },
    [addToCart],
  );

  const moveAllWishlistToCart = useCallback(() => {
    setWishlistItems((current) => {
      current.forEach((item) => addToCart(item, 1, { open: false }));
      if (current.length > 0) {
        setWishlistOpen(false);
        setCartOpen(true);
      }
      return [];
    });
  }, [addToCart]);

  const value = useMemo<StoreCommerceContextValue>(
    () => ({
      tenantSlug: config.tenantSlug,
      cartItems,
      wishlistItems,
      cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      wishlistCount: wishlistItems.length,
      cartSubtotalInr: cartItems.reduce(
        (sum, item) => sum + item.priceInr * item.quantity,
        0,
      ),
      cartOpen,
      wishlistOpen,
      hydrated,
      formatPrice,
      openCart: () => {
        setWishlistOpen(false);
        setCartOpen(true);
      },
      closeCart: () => setCartOpen(false),
      openWishlist: () => {
        setCartOpen(false);
        setWishlistOpen(true);
      },
      closeWishlist: () => setWishlistOpen(false),
      addToCart,
      setCartQuantity,
      changeCartQuantity,
      removeFromCart,
      clearCart,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
      moveWishlistToCart,
      moveAllWishlistToCart,
    }),
    [
      config.tenantSlug,
      cartItems,
      wishlistItems,
      cartOpen,
      wishlistOpen,
      hydrated,
      formatPrice,
      addToCart,
      setCartQuantity,
      changeCartQuantity,
      removeFromCart,
      clearCart,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
      moveWishlistToCart,
      moveAllWishlistToCart,
    ],
  );

  return (
    <StoreCommerceContext.Provider value={value}>
      {children}
    </StoreCommerceContext.Provider>
  );
}

export function useStoreCommerce() {
  const ctx = useContext(StoreCommerceContext);
  if (!ctx) {
    throw new Error("useStoreCommerce must be used within StoreCommerceProvider");
  }
  return ctx;
}

/** Safe hook for optional usage outside provider (returns null). */
export function useStoreCommerceOptional() {
  return useContext(StoreCommerceContext);
}
