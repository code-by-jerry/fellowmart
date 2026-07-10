"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useStoreCommerce } from "@/components/storefront/StoreCommerceProvider";
import { storePath } from "@/lib/routes/store-routes";
import { storeCheckoutPath } from "@/lib/storefront/store-links";
import { cartLineKey } from "@/lib/storefront/resolve-variant";

export function CartPageContent() {
  const {
    tenantSlug,
    cartItems,
    cartCount,
    cartSubtotalInr,
    formatPrice,
    changeCartQuantity,
    removeFromCart,
    openCart,
  } = useStoreCommerce();

  const categoriesHref = storePath(tenantSlug, "categories");
  const checkoutHref = storeCheckoutPath(tenantSlug);

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-[1378px] px-4 py-16 text-center sm:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-gray-500">
          Browse products and add items to see them here.
        </p>
        <Link
          href={categoriesHref}
          className="mt-8 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1378px] px-4 py-10 sm:px-8 lg:px-[32px]">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Cart</h1>
          <p className="mt-1 text-sm text-gray-500">
            {cartCount} {cartCount === 1 ? "item" : "items"} in your bag
          </p>
        </div>
        <button
          type="button"
          onClick={openCart}
          className="text-sm font-medium text-primary hover:underline"
        >
          Open cart drawer
        </button>
      </div>

      <div className="space-y-4">
        {cartItems.map((item, index) => {
          const href = storePath(
            tenantSlug,
            `categories/${item.categorySlug || "all"}/${item.slug}`,
          );
          const lineKey = cartLineKey(item.productId, item.variantId);
          return (
            <article
              key={lineKey}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <Link
                href={href}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs text-gray-400">
                    {index + 1}
                  </span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={href}
                      className="font-medium text-gray-900 hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    {item.variantLabel ? (
                      <p className="mt-0.5 text-sm text-gray-500">{item.variantLabel}</p>
                    ) : null}
                  </div>
                  <strong className="shrink-0 text-sm text-gray-900">
                    {formatPrice(item.priceInr * item.quantity)}
                  </strong>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-lg border border-gray-200">
                    <button
                      type="button"
                      className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50"
                      aria-label={`Decrease ${item.name}`}
                      onClick={() => changeCartQuantity(lineKey, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-50"
                      aria-label={`Increase ${item.name}`}
                      onClick={() => changeCartQuantity(lineKey, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
                    onClick={() => removeFromCart(lineKey)}
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between text-base">
          <span className="text-gray-600">Subtotal</span>
          <strong className="text-gray-900">{formatPrice(cartSubtotalInr)}</strong>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Shipping and taxes calculated at checkout.
        </p>
        <Link
          href={checkoutHref}
          className="mt-5 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Proceed to checkout
        </Link>
        <button
          type="button"
          className="mt-3 w-full text-center text-sm font-medium text-gray-600 hover:text-primary"
          onClick={openCart}
        >
          Open cart drawer
        </button>
        <Link
          href={categoriesHref}
          className="mt-3 block text-center text-sm font-medium text-gray-600 hover:text-primary"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
