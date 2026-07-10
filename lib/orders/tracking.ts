export type OrderTrackingStep = {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  current: boolean;
  timestamp?: string | null;
};

export type OrderTrackingInput = {
  status: string;
  createdAt: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  trackingNumber?: string | null;
  trackingCarrier?: string | null;
};

const FULFILLMENT_RANK: Record<string, number> = {
  pending: 0,
  payment_failed: 0,
  cancelled: 0,
  paid: 1,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
};

export function buildOrderTrackingSteps(
  input: OrderTrackingInput,
): OrderTrackingStep[] {
  const rank = FULFILLMENT_RANK[input.status] ?? 0;
  const paymentDone =
    rank >= 1 ||
    input.status === "confirmed" ||
    input.status === "paid" ||
    input.status === "processing" ||
    input.status === "shipped" ||
    input.status === "delivered";
  const processingDone = rank >= 2;
  const shippedDone = rank >= 3 || Boolean(input.shippedAt);
  const deliveredDone = rank >= 4 || Boolean(input.deliveredAt);

  const steps: OrderTrackingStep[] = [
    {
      id: "placed",
      label: "Order placed",
      description: "We received your order.",
      completed: true,
      current: !paymentDone,
      timestamp: input.createdAt,
    },
    {
      id: "payment",
      label: "Payment confirmed",
      description:
        input.status === "payment_failed"
          ? "Payment failed — please try again or contact support."
          : "Your payment was confirmed.",
      completed: paymentDone && input.status !== "payment_failed",
      current: paymentDone && !processingDone && input.status !== "payment_failed",
      timestamp: paymentDone ? input.createdAt : null,
    },
    {
      id: "processing",
      label: "Processing",
      description: "We're preparing your items for shipment.",
      completed: processingDone,
      current: processingDone && !shippedDone,
    },
    {
      id: "shipped",
      label: "Shipped",
      description: input.trackingNumber
        ? `${input.trackingCarrier ?? "Courier"} · ${input.trackingNumber}`
        : "Your package is on the way.",
      completed: shippedDone,
      current: shippedDone && !deliveredDone,
      timestamp: input.shippedAt ?? null,
    },
    {
      id: "delivered",
      label: "Delivered",
      description: "Your order has been delivered.",
      completed: deliveredDone,
      current: deliveredDone,
      timestamp: input.deliveredAt ?? null,
    },
  ];

  if (input.status === "payment_failed") {
    return steps.filter((step) => step.id === "placed" || step.id === "payment");
  }

  if (input.status === "cancelled") {
    return [
      steps[0],
      {
        id: "cancelled",
        label: "Cancelled",
        description: "This order was cancelled.",
        completed: true,
        current: true,
      },
    ];
  }

  return steps;
}

export const BUSINESS_ORDER_STATUSES = [
  "pending",
  "paid",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "payment_failed",
  "cancelled",
] as const;

export type BusinessOrderStatus = (typeof BUSINESS_ORDER_STATUSES)[number];
