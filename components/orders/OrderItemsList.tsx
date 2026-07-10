import Image from "next/image";
import Link from "next/link";
import type { OrderLineItem } from "@/lib/business/order-details";
import { storeProductPath } from "@/lib/storefront/store-links";

type OrderItemsListProps = {
  items: OrderLineItem[];
  tenantSlug: string;
  formatPrice: (amountInr: number) => string;
  compact?: boolean;
};

export function OrderItemsList({
  items,
  tenantSlug,
  formatPrice,
  compact = false,
}: OrderItemsListProps) {
  if (!items.length) {
    return (
      <p className="text-sm text-gray-500">No line items found for this order.</p>
    );
  }

  return (
    <ul className={compact ? "space-y-3" : "divide-y divide-gray-100"}>
      {items.map((item) => {
        const title =
          item.variantName && item.variantName !== item.productName
            ? `${item.productName} · ${item.variantName}`
            : item.productName;
        const href = item.productSlug
          ? storeProductPath(tenantSlug, item.productSlug)
          : null;

        return (
          <li
            key={item.id}
            className={compact ? "flex gap-3" : "flex gap-4 py-4 first:pt-0 last:pb-0"}
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                  No img
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              {href ? (
                <Link
                  href={href}
                  className="text-sm font-semibold text-gray-900 hover:text-primary"
                >
                  {title}
                </Link>
              ) : (
                <p className="text-sm font-semibold text-gray-900">{title}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Qty {item.quantity} × {formatPrice(item.unitPriceInr)}
              </p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatPrice(item.lineTotalInr)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
