"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { useStoreCommerce } from "@/components/storefront/StoreCommerceProvider";
import type {
  CheckoutPaymentMethod,
  CheckoutShippingAddress,
} from "@/lib/checkout/types";
import {
  FLAT_SHIPPING_INR,
  FREE_SHIPPING_THRESHOLD_INR,
  calculateShippingInr,
} from "@/lib/checkout/shipping";
import { storePath } from "@/lib/routes/store-routes";
import {
  storeCategoriesPath,
  storeCheckoutConfirmationPath,
} from "@/lib/storefront/store-links";
import { cartLineKey } from "@/lib/storefront/resolve-variant";
import { formatAddressLine, type CustomerAddress } from "@/lib/types/customer";
import { INDIAN_STATES } from "@/lib/constants/india";
import { cn } from "@/lib/utils";
import { launchRazorpayCheckout } from "@/lib/payments/razorpay-client";

type CheckoutPageContentProps = {
  savedAddresses?: CustomerAddress[];
  defaultEmail?: string | null;
  defaultName?: string | null;
  defaultPhone?: string | null;
  isLoggedIn: boolean;
  onlinePaymentsEnabled?: boolean;
  storeName?: string;
};

function emptyAddress(
  defaults?: Pick<
    CheckoutPageContentProps,
    "defaultName" | "defaultEmail" | "defaultPhone"
  >,
): CheckoutShippingAddress {
  return {
    label: "Home",
    full_name: defaults?.defaultName ?? "",
    phone: defaults?.defaultPhone ?? "",
    email: defaults?.defaultEmail ?? "",
    address_line1: "",
    address_line2: "",
    landmark: "",
    city: "",
    state: "",
    postal_code: "",
    country: "IN",
  };
}

function addressFromSaved(address: CustomerAddress): CheckoutShippingAddress {
  return {
    label: address.label,
    full_name: address.full_name,
    phone: address.phone,
    address_line1: address.address_line1,
    address_line2: address.address_line2,
    landmark: address.landmark,
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: address.country || "IN",
  };
}

export function CheckoutPageContent({
  savedAddresses = [],
  defaultEmail,
  defaultName,
  defaultPhone,
  isLoggedIn,
  onlinePaymentsEnabled = false,
  storeName = "Store",
}: CheckoutPageContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>(
    onlinePaymentsEnabled ? "online" : "cod",
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses.find((entry) => entry.is_default)?.id ??
      savedAddresses[0]?.id ??
      null,
  );
  const [useNewAddress, setUseNewAddress] = useState(
    savedAddresses.length === 0,
  );
  const [address, setAddress] = useState<CheckoutShippingAddress>(() =>
    savedAddresses.length
      ? addressFromSaved(
          savedAddresses.find((entry) => entry.is_default) ?? savedAddresses[0],
        )
      : emptyAddress({ defaultName, defaultEmail, defaultPhone }),
  );
  const [customerEmail, setCustomerEmail] = useState(defaultEmail ?? "");
  const [customerName, setCustomerName] = useState(defaultName ?? "");
  const [notes, setNotes] = useState("");

  const {
    tenantSlug,
    cartItems,
    cartSubtotalInr,
    formatPrice,
    clearCart,
    hydrated,
  } = useStoreCommerce();

  const cartHref = storePath(tenantSlug, "cart");
  const categoriesHref = storeCategoriesPath(tenantSlug);

  const shippingInr = useMemo(
    () => calculateShippingInr(cartSubtotalInr),
    [cartSubtotalInr],
  );
  const totalInr = cartSubtotalInr + shippingInr;

  useEffect(() => {
    if (!hydrated) return;
    if (cartItems.length === 0) {
      router.replace(cartHref);
    }
  }, [hydrated, cartItems.length, router, cartHref]);

  useEffect(() => {
    if (!selectedAddressId || useNewAddress) return;
    const saved = savedAddresses.find((entry) => entry.id === selectedAddressId);
    if (saved) {
      setAddress(addressFromSaved(saved));
      setCustomerName(saved.full_name);
      if (!customerEmail && defaultEmail) {
        setCustomerEmail(defaultEmail);
      }
    }
  }, [
    selectedAddressId,
    useNewAddress,
    savedAddresses,
    customerEmail,
    defaultEmail,
  ]);

  const updateAddressField = <K extends keyof CheckoutShippingAddress>(
    key: K,
    value: CheckoutShippingAddress[K],
  ) => {
    setAddress((current) => ({ ...current, [key]: value }));
  };

  const placeOrder = () => {
    setError("");

    const name = customerName.trim() || address.full_name.trim();
    const email = customerEmail.trim().toLowerCase();

    if (!name) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/store/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantSlug,
            lines: cartItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            })),
            customerName: name,
            customerEmail: email,
            shippingAddress: {
              ...address,
              full_name: name,
              email,
            },
            paymentMethod,
            notes,
          }),
        });

        const payload = (await response.json()) as {
          error?: string;
          order?: { orderId: string; orderNumber: string };
          razorpay?: {
            keyId: string;
            razorpayOrderId: string;
            amountPaise: number;
            currency: string;
          };
        };

        if (!response.ok) {
          setError(payload.error ?? "Could not place order.");
          return;
        }

        if (paymentMethod === "online" && payload.razorpay && payload.order) {
          const callbackUrl = new URL(
            "/api/store/checkout/razorpay-callback",
            window.location.origin,
          );
          callbackUrl.searchParams.set("tenant", tenantSlug);
          callbackUrl.searchParams.set("orderId", payload.order.orderId);

          const verifyPayment = async (payment: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            const verifyResponse = await fetch("/api/store/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tenantSlug,
                orderId: payload.order!.orderId,
                razorpay_order_id: payment.razorpay_order_id,
                razorpay_payment_id: payment.razorpay_payment_id,
                razorpay_signature: payment.razorpay_signature,
              }),
            });

            const verifyPayload = (await verifyResponse.json()) as {
              error?: string;
              orderNumber?: string;
            };

            if (!verifyResponse.ok) {
              setError(
                verifyPayload.error ??
                  "Payment received but verification failed. Contact support with your order number.",
              );
              return;
            }

            clearCart();
            router.push(
              storeCheckoutConfirmationPath(
                tenantSlug,
                verifyPayload.orderNumber ?? payload.order!.orderNumber,
              ),
            );
          };

          await launchRazorpayCheckout({
            options: {
              key: payload.razorpay.keyId,
              amount: payload.razorpay.amountPaise,
              currency: payload.razorpay.currency,
              name: storeName,
              description: `Order ${payload.order.orderNumber}`,
              order_id: payload.razorpay.razorpayOrderId,
              callback_url: callbackUrl.toString(),
              redirect: true,
              prefill: {
                name,
                email,
                contact: address.phone,
              },
              theme: { color: "#111111" },
            },
            onSuccess: verifyPayment,
            onDismiss: () => {
              setError(
                "Payment was cancelled. Your order is saved as pending — try UPI success@razorpay or pay again.",
              );
            },
            onFailure: (message) => setError(message),
          });
          return;
        }

        const orderNumber = payload.order?.orderNumber;
        clearCart();
        router.push(
          storeCheckoutConfirmationPath(tenantSlug, orderNumber ?? undefined),
        );
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Something went wrong. Please try again.",
        );
      }
    });
  };

  if (!hydrated) {
    return (
      <div className="mx-auto flex max-w-[1378px] items-center justify-center px-4 py-24 sm:px-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-8">
        <p className="text-sm text-gray-600">Your cart is empty.</p>
        <Link
          href={categoriesHref}
          className="mt-4 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1378px] px-4 py-10 sm:px-8 lg:px-[32px]">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href={cartHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} ready
            to order
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Secure checkout
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Contact details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  readOnly={isLoggedIn && Boolean(defaultEmail)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary read-only:bg-gray-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={address.phone}
                  onChange={(event) =>
                    updateAddressField("phone", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">
                Delivery address
              </h2>
            </div>

            {savedAddresses.length > 0 ? (
              <div className="mt-4 space-y-3">
                {savedAddresses.map((entry) => (
                  <label
                    key={entry.id}
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                      !useNewAddress && selectedAddressId === entry.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <input
                      type="radio"
                      name="saved-address"
                      className="mt-1 accent-primary"
                      checked={!useNewAddress && selectedAddressId === entry.id}
                      onChange={() => {
                        setUseNewAddress(false);
                        setSelectedAddressId(entry.id);
                      }}
                    />
                    <span>
                      <strong className="block text-sm text-gray-900">
                        {entry.label} · {entry.full_name}
                      </strong>
                      <span className="mt-1 block text-sm text-gray-500">
                        {formatAddressLine(entry)}
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        {entry.phone}
                      </span>
                    </span>
                  </label>
                ))}
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                    useNewAddress
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <input
                    type="radio"
                    name="saved-address"
                    className="accent-primary"
                    checked={useNewAddress}
                    onChange={() => setUseNewAddress(true)}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Use a different address
                  </span>
                </label>
              </div>
            ) : null}

            {useNewAddress || savedAddresses.length === 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={address.address_line1}
                    onChange={(event) =>
                      updateAddressField("address_line1", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address line 2
                  </label>
                  <input
                    value={address.address_line2 ?? ""}
                    onChange={(event) =>
                      updateAddressField("address_line2", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={address.city}
                    onChange={(event) =>
                      updateAddressField("city", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={address.state}
                    onChange={(event) =>
                      updateAddressField("state", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    PIN code <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={address.postal_code}
                    onChange={(event) =>
                      updateAddressField("postal_code", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Landmark
                  </label>
                  <input
                    value={address.landmark ?? ""}
                    onChange={(event) =>
                      updateAddressField("landmark", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment method
            </h2>
            <div className="mt-4 space-y-3">
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <input
                  type="radio"
                  name="payment-method"
                  className="mt-1 accent-primary"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Banknote className="h-4 w-4" />
                    Cash on delivery
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    Pay when your order arrives.
                  </span>
                </span>
              </label>

              <label
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 transition-colors",
                  onlinePaymentsEnabled
                    ? paymentMethod === "online"
                      ? "cursor-pointer border-primary bg-primary/5"
                      : "cursor-pointer border-gray-200 hover:border-gray-300"
                    : "cursor-not-allowed border-dashed border-gray-200 bg-gray-50 opacity-70",
                )}
              >
                <input
                  type="radio"
                  name="payment-method"
                  className="mt-1 accent-primary"
                  checked={paymentMethod === "online"}
                  disabled={!onlinePaymentsEnabled}
                  onChange={() => setPaymentMethod("online")}
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <CreditCard className="h-4 w-4" />
                    Pay online
                    {onlinePaymentsEnabled ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        Razorpay
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                        Unavailable
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    Card, UPI, netbanking, and wallets via Razorpay.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Order notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Delivery instructions, gift message, etc."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </section>
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
            <div className="mt-4 space-y-4">
              {cartItems.map((item, index) => {
                const lineKey = cartLineKey(item.productId, item.variantId);
                return (
                  <article key={lineKey} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xs text-gray-400">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.name}
                      </p>
                      {item.variantLabel ? (
                        <p className="text-xs text-gray-500">
                          {item.variantLabel}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-gray-500">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <strong className="shrink-0 text-sm text-gray-900">
                      {formatPrice(item.priceInr * item.quantity)}
                    </strong>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(cartSubtotalInr)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {shippingInr === 0
                    ? "Free"
                    : formatPrice(shippingInr)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Free shipping on orders above{" "}
                {formatPrice(FREE_SHIPPING_THRESHOLD_INR)}. Otherwise{" "}
                {formatPrice(FLAT_SHIPPING_INR)} flat rate.
              </p>
              <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(totalInr)}</span>
              </div>
            </div>

            {error ? (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              disabled={isPending}
              onClick={placeOrder}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {paymentMethod === "online"
                    ? "Processing payment…"
                    : "Placing order…"}
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  {paymentMethod === "online" ? "Pay now" : "Place order"}
                </>
              )}
            </button>

            <Link
              href={categoriesHref}
              className="mt-3 block text-center text-sm font-medium text-gray-500 hover:text-primary"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
