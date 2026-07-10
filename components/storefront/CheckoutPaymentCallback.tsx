"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { storeCheckoutConfirmationPath } from "@/lib/storefront/store-links";

type PaymentCallbackProps = {
  tenantSlug: string;
};

export function CheckoutPaymentCallback({
  tenantSlug,
}: PaymentCallbackProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const orderId = searchParams.get("orderId")?.trim();
    const razorpayOrderId = searchParams.get("razorpay_order_id")?.trim();
    const razorpayPaymentId = searchParams.get("razorpay_payment_id")?.trim();
    const razorpaySignature = searchParams.get("razorpay_signature")?.trim();

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      setError("Payment details were incomplete. Please try checkout again.");
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const response = await fetch("/api/store/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantSlug,
            orderId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
          }),
        });

        const payload = (await response.json()) as {
          error?: string;
          orderNumber?: string;
        };

        if (!response.ok) {
          throw new Error(
            payload.error ?? "Payment verification failed. Contact support.",
          );
        }

        if (!cancelled) {
          router.replace(
            storeCheckoutConfirmationPath(
              tenantSlug,
              payload.orderNumber ?? undefined,
            ),
          );
        }
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Payment verification failed.",
          );
        }
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams, tenantSlug]);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      <p className="mt-4 text-sm text-gray-600">Confirming your payment…</p>
    </div>
  );
}
