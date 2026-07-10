import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock3, Package } from "lucide-react";
import { OrderItemsList } from "@/components/orders/OrderItemsList";
import { OrderTrackingTimeline } from "@/components/orders/OrderTrackingTimeline";
import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import { getOrderDetailsByNumber } from "@/lib/business/order-details";
import { buildOrderTrackingSteps } from "@/lib/orders/tracking";
import { formatStorePrice } from "@/lib/storefront/pricing";
import {
  storeCategoriesPath,
  storeHomePath,
  storeOrderDetailPath,
  storeOrdersPath,
} from "@/lib/storefront/store-links";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role-client";
import { normalizeTenantSlug } from "@/lib/utils/tenant";

export default async function StoreCheckoutConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { slug: rawSlug } = await params;
  const { order: orderNumber } = await searchParams;
  const slug = normalizeTenantSlug(rawSlug);
  const storefront = await getStorefrontContext(slug);

  if (!storefront) {
    notFound();
  }

  if (!orderNumber?.trim()) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const service = createServiceRoleClient();
  const order = await getOrderDetailsByNumber(
    service,
    storefront.tenantId,
    orderNumber.trim(),
  );

  if (!order) {
    notFound();
  }

  if (user && order.id) {
    const { data: ownerCheck } = await service
      .from("orders")
      .select("user_id")
      .eq("id", order.id)
      .maybeSingle();
    if (ownerCheck?.user_id && ownerCheck.user_id !== user.id) {
      notFound();
    }
  }

  const isPaid =
    order.status === "paid" ||
    order.status === "confirmed" ||
    order.status === "processing" ||
    order.status === "shipped" ||
    order.status === "delivered" ||
    order.paymentStatus === "captured";
  const isPendingPayment =
    order.status === "pending" &&
    (order.paymentMethod === "razorpay" || Boolean(order.paymentStatus));

  const formatPrice = (amount: number) => formatStorePrice(storefront, amount);
  const trackingSteps = buildOrderTrackingSteps({
    status: order.status,
    createdAt: order.createdAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    trackingNumber: order.trackingNumber,
    trackingCarrier: order.trackingCarrier,
  });

  const placedAt = order.createdAt
    ? new Date(order.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <TenantStoreLayout slug={slug} showCategoryNav={false}>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <div className="text-center">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              isPendingPayment
                ? "bg-amber-50 text-amber-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {isPendingPayment ? (
              <Clock3 className="h-8 w-8" />
            ) : (
              <CheckCircle2 className="h-8 w-8" />
            )}
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            {isPendingPayment ? "Payment pending" : "Order placed"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {isPendingPayment
              ? `Hi${order.customerName ? ` ${order.customerName}` : ""}, we received your order but payment is not confirmed yet.`
              : `Thank you${order.customerName ? `, ${order.customerName}` : ""}. Your order has been received.`}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3 border-b border-gray-100 pb-5">
            <Package className="mt-0.5 h-5 w-5 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500">Order number</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {order.orderNumber}
              </p>
              {placedAt ? (
                <p className="mt-2 text-sm text-gray-500">Placed on {placedAt}</p>
              ) : null}
              <p className="mt-2 text-sm text-gray-600">
                Status:{" "}
                <span className="font-medium capitalize text-gray-900">
                  {order.status.replace(/_/g, " ")}
                </span>
              </p>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatPrice(order.totalInr)}
            </p>
          </div>

          <div className="mt-5">
            <h2 className="text-sm font-semibold text-gray-900">Items ordered</h2>
            <div className="mt-3">
              <OrderItemsList
                items={order.items}
                tenantSlug={slug}
                formatPrice={formatPrice}
                compact
              />
            </div>
          </div>
        </div>

        {isPaid ? (
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Tracking</h2>
            <div className="mt-4">
              <OrderTrackingTimeline steps={trackingSteps} />
            </div>
          </section>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={storeOrderDetailPath(slug, order.orderNumber)}
            className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            View order details
          </Link>
          {user ? (
            <Link
              href={storeOrdersPath(slug)}
              className="inline-flex rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              All orders
            </Link>
          ) : null}
          <Link
            href={storeHomePath(slug)}
            className="inline-flex rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Continue shopping
          </Link>
          <Link
            href={storeCategoriesPath(slug)}
            className="inline-flex text-sm font-medium text-gray-500 hover:text-primary"
          >
            Browse categories
          </Link>
        </div>
      </div>
    </TenantStoreLayout>
  );
}
