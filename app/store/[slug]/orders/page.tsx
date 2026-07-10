import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import { listOrderItemPreviews } from "@/lib/business/order-details";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role-client";
import { listCustomerStoreOrders } from "@/lib/business/tenant-orders";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { formatStorePrice } from "@/lib/storefront/pricing";
import {
  storeHomePath,
  storeOrderDetailPath,
} from "@/lib/storefront/store-links";
import { storePath } from "@/lib/routes/store-routes";
import { normalizeTenantSlug } from "@/lib/utils/tenant";

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

export default async function StoreOrdersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeTenantSlug(rawSlug);
  const storefront = await getStorefrontContext(slug);

  if (!storefront) {
    redirect(storeHomePath(slug));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(storePath(slug, "orders"))}`);
  }

  const orders = await listCustomerStoreOrders(
    supabase,
    storefront.tenantId,
    user.id,
  );

  const service = createServiceRoleClient();
  const itemPreviews = await listOrderItemPreviews(
    service,
    orders.map((order) => order.id),
  );

  return (
    <TenantStoreLayout slug={slug} showCategoryNav={false}>
      <div className="mx-auto max-w-[1378px] px-4 py-10 sm:px-8 lg:px-[32px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Your orders
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track purchases from {storefront.tenantName}.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <Package className="h-6 w-6" />
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">
              No orders yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              When you place an order, it will show up here.
            </p>
            <Link
              href={storeHomePath(slug)}
              className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const items = itemPreviews.get(order.id) ?? [];
              const preview = items[0];
              const extraCount = Math.max(0, items.length - 1);

              return (
                <article
                  key={order.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 gap-4">
                      {preview?.imageUrl ? (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                          <Image
                            src={preview.imageUrl}
                            alt={preview.productName}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      ) : null}
                      <div className="min-w-0">
                        <Link
                          href={storeOrderDetailPath(slug, order.order_number)}
                          className="text-base font-semibold text-gray-900 hover:text-primary"
                        >
                          {order.order_number}
                        </Link>
                        <p className="mt-1 text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                        {preview ? (
                          <p className="mt-2 text-sm text-gray-700">
                            {preview.productName}
                            {extraCount > 0
                              ? ` + ${extraCount} more item${extraCount === 1 ? "" : "s"}`
                              : null}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-semibold text-gray-900">
                        {formatStorePrice(storefront, order.total_amount)}
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClass(order.status)}`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-gray-500 capitalize">
                      Payment: {order.payment_method}
                      {order.payment_status ? ` · ${order.payment_status}` : ""}
                    </p>
                    <Link
                      href={storeOrderDetailPath(slug, order.order_number)}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Track order
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </TenantStoreLayout>
  );
}
