import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OrderItemsList } from "@/components/orders/OrderItemsList";
import { OrderTrackingTimeline } from "@/components/orders/OrderTrackingTimeline";
import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import { getOrderDetailsByNumber } from "@/lib/business/order-details";
import { formatAddressLine } from "@/lib/types/customer";
import { buildOrderTrackingSteps } from "@/lib/orders/tracking";
import { formatStorePrice } from "@/lib/storefront/pricing";
import {
  storeOrdersPath,
} from "@/lib/storefront/store-links";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { createServiceRoleClient } from "@/utils/supabase/service-role-client";
import { createClient } from "@/utils/supabase/server";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { notFound, redirect } from "next/navigation";
import { storePath } from "@/lib/routes/store-routes";

function statusClass(status: string) {
  const map: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700",
    confirmed: "bg-blue-50 text-blue-700",
    processing: "bg-indigo-50 text-indigo-700",
    shipped: "bg-sky-50 text-sky-700",
    delivered: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    payment_failed: "bg-red-50 text-red-700",
    cancelled: "bg-gray-100 text-gray-600",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

export default async function StoreOrderDetailPage({
  params,
}: {
  params: Promise<{ slug: string; orderNumber: string }>;
}) {
  const { slug: rawSlug, orderNumber: rawOrderNumber } = await params;
  const slug = normalizeTenantSlug(rawSlug);
  const orderNumber = decodeURIComponent(rawOrderNumber).trim();
  const storefront = await getStorefrontContext(slug);

  if (!storefront) {
    redirect(storeOrdersPath(slug));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(storePath(slug, `orders/${orderNumber}`))}`,
    );
  }

  const service = createServiceRoleClient();
  const order = await getOrderDetailsByNumber(
    service,
    storefront.tenantId,
    orderNumber,
  );

  if (!order) {
    notFound();
  }

  const { data: ownerCheck } = await service
    .from("orders")
    .select("user_id, customer_email")
    .eq("id", order.id)
    .maybeSingle();

  const ownsOrder =
    ownerCheck?.user_id === user.id ||
    (ownerCheck?.customer_email &&
      user.email &&
      ownerCheck.customer_email.toLowerCase() === user.email.toLowerCase());

  if (!ownsOrder) {
    notFound();
  }

  const formatPrice = (amount: number) => formatStorePrice(storefront, amount);
  const trackingSteps = buildOrderTrackingSteps({
    status: order.status,
    createdAt: order.createdAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    trackingNumber: order.trackingNumber,
    trackingCarrier: order.trackingCarrier,
  });

  return (
    <TenantStoreLayout slug={slug} showCategoryNav={false}>
      <div className="mx-auto max-w-[1378px] px-4 py-10 sm:px-8 lg:px-[32px]">
        <Link
          href={storeOrdersPath(slug)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Placed {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusClass(order.status)}`}
          >
            {order.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Items</h2>
              <div className="mt-4">
                <OrderItemsList
                  items={order.items}
                  tenantSlug={slug}
                  formatPrice={formatPrice}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Order tracking
              </h2>
              <div className="mt-6">
                <OrderTrackingTimeline steps={trackingSteps} />
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(order.subtotalInr)}</dd>
                </div>
                <div className="flex justify-between text-gray-600">
                  <dt>Shipping</dt>
                  <dd>
                    {order.shippingInr <= 0
                      ? "Free"
                      : formatPrice(order.shippingInr)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
                  <dt>Total</dt>
                  <dd>{formatPrice(order.totalInr)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-sm capitalize text-gray-500">
                Payment: {order.paymentMethod ?? "cod"}
                {order.paymentStatus ? ` · ${order.paymentStatus}` : ""}
              </p>
            </section>

            {order.shippingAddress ? (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  Delivery address
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
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
          </aside>
        </div>
      </div>
    </TenantStoreLayout>
  );
}
