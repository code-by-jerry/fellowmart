import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OrderFulfillmentForm } from "@/components/business/OrderFulfillmentForm";
import { OrderItemsList } from "@/components/orders/OrderItemsList";
import { OrderTrackingTimeline } from "@/components/orders/OrderTrackingTimeline";
import { requireTenantManager } from "@/lib/auth/business-access";
import { getOrderDetailsByNumber } from "@/lib/business/order-details";
import { formatAddressLine } from "@/lib/types/customer";
import { buildOrderTrackingSteps } from "@/lib/orders/tracking";
import { storeOrderDetailPath } from "@/lib/storefront/store-links";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { notFound } from "next/navigation";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function BusinessOrderDetailPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; orderNumber: string }>;
}) {
  const { tenantSlug: rawSlug, orderNumber: rawOrderNumber } = await params;
  const tenantSlug = normalizeTenantSlug(rawSlug);
  const orderNumber = decodeURIComponent(rawOrderNumber).trim();
  const { supabase, tenant } = await requireTenantManager(tenantSlug);
  const order = await getOrderDetailsByNumber(supabase, tenant.id, orderNumber);

  if (!order) {
    notFound();
  }

  const trackingSteps = buildOrderTrackingSteps({
    status: order.status,
    createdAt: order.createdAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    trackingNumber: order.trackingNumber,
    trackingCarrier: order.trackingCarrier,
  });

  return (
    <div className="space-y-6">
      <Link
        href={`/business/${tenantSlug}/orders`}
        className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-[13px] text-gray-500">
            {order.customerName} · {order.customerEmail}
          </p>
          <p className="mt-1 text-[13px] text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <p className="text-xl font-semibold text-gray-900">
          {formatMoney(order.totalInr)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[15px] font-semibold text-gray-900">Items</h2>
            <div className="mt-4">
              <OrderItemsList
                items={order.items}
                tenantSlug={tenantSlug}
                formatPrice={formatMoney}
              />
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-[15px] font-semibold text-gray-900">
              Customer tracking view
            </h2>
            <div className="mt-4">
              <OrderTrackingTimeline steps={trackingSteps} />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <OrderFulfillmentForm
            tenantSlug={tenantSlug}
            orderNumber={order.orderNumber}
            initialStatus={order.status}
            initialTrackingNumber={order.trackingNumber ?? ""}
            initialTrackingCarrier={order.trackingCarrier ?? ""}
          />

          <section className="rounded-xl border border-gray-200 bg-white p-5 text-[13px]">
            <h3 className="font-semibold text-gray-900">Payment</h3>
            <p className="mt-2 capitalize text-gray-600">
              {order.paymentMethod ?? "cod"}
              {order.paymentStatus ? ` · ${order.paymentStatus}` : ""}
            </p>
            {order.razorpayPaymentId ? (
              <p className="mt-2 break-all text-gray-500">
                {order.razorpayPaymentId}
              </p>
            ) : null}
          </section>

          {order.shippingAddress ? (
            <section className="rounded-xl border border-gray-200 bg-white p-5 text-[13px]">
              <h3 className="font-semibold text-gray-900">Shipping address</h3>
              <p className="mt-2 leading-relaxed text-gray-600">
                {formatAddressLine({
                  address_line1: order.shippingAddress.address_line1,
                  address_line2: order.shippingAddress.address_line2 ?? null,
                  landmark: order.shippingAddress.landmark ?? null,
                  city: order.shippingAddress.city,
                  state: order.shippingAddress.state,
                  postal_code: order.shippingAddress.postal_code,
                })}
              </p>
            </section>
          ) : null}

          <p className="text-[12px] text-gray-400">
            Customer link: {storeOrderDetailPath(tenantSlug, order.orderNumber)}
          </p>
        </aside>
      </div>
    </div>
  );
}
