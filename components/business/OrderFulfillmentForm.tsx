"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BUSINESS_ORDER_STATUSES } from "@/lib/orders/tracking";

type OrderFulfillmentFormProps = {
  tenantSlug: string;
  orderNumber: string;
  initialStatus: string;
  initialTrackingNumber: string;
  initialTrackingCarrier: string;
};

export function OrderFulfillmentForm({
  tenantSlug,
  orderNumber,
  initialStatus,
  initialTrackingNumber,
  initialTrackingCarrier,
}: OrderFulfillmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);
  const [trackingCarrier, setTrackingCarrier] = useState(initialTrackingCarrier);

  const save = () => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        const response = await fetch("/api/business/orders/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantSlug,
            orderNumber,
            status,
            trackingNumber,
            trackingCarrier,
          }),
        });
        const payload = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? "Could not update order.");
        }
        setSuccess("Order updated.");
        router.refresh();
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Could not update order.",
        );
      }
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
      <div>
        <h3 className="text-[15px] font-semibold text-gray-900">
          Fulfillment & tracking
        </h3>
        <p className="mt-1 text-[13px] text-gray-500">
          Update order status and add courier tracking for customers.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[13px] font-medium text-gray-700">
            Order status
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {BUSINESS_ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[13px] font-medium text-gray-700">
            Courier / carrier
          </label>
          <input
            value={trackingCarrier}
            onChange={(event) => setTrackingCarrier(event.target.value)}
            placeholder="e.g. Delhivery, Blue Dart"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[13px] font-medium text-gray-700">
            Tracking number
          </label>
          <input
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="AWB / tracking ID"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <button
        type="button"
        onClick={save}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save changes
      </button>
    </div>
  );
}
