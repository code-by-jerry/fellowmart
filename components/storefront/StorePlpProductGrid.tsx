import {
  StoreProductCard,
  StoreProductCardGrid,
} from "@/components/storefront/StoreProductCard";
import { toStoreProductRef } from "@/lib/storefront/product-ref";
import type { PlpProduct } from "@/lib/storefront/plp-facets";
import {
  discountLabel,
  formatStorePrice,
  type StorefrontPricing,
} from "@/lib/storefront/pricing";
import { storeProductPath } from "@/lib/storefront/store-links";

type StorePlpProductGridProps = {
  products: PlpProduct[];
  tenantSlug: string;
  storefront: StorefrontPricing;
  categorySlug?: string | null;
  gridClassName?: string;
  emptyMessage?: string;
  ariaLabel: string;
};

export function StorePlpProductGrid({
  products,
  tenantSlug,
  storefront,
  categorySlug,
  gridClassName,
  emptyMessage = "No products match your filters.",
  ariaLabel,
}: StorePlpProductGridProps) {
  return (
    <StoreProductCardGrid className={gridClassName} aria-label={ariaLabel}>
      {products.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        products.map((item, index) => {
          const price = Number(item.price);
          const compare = item.compare_at_price
            ? Number(item.compare_at_price)
            : null;
          const discount = discountLabel(price, compare);
          const itemCategorySlug = categorySlug ?? item.category_slug ?? null;

          return (
            <StoreProductCard
              key={item.id}
              product={toStoreProductRef({
                id: item.id,
                name: item.name,
                slug: item.slug,
                category_slug: itemCategorySlug,
                featured_image_url: item.featured_image_url,
                price,
                compare_at_price: compare,
              })}
              href={storeProductPath(tenantSlug, item.slug, itemCategorySlug)}
              price={formatStorePrice(storefront, price)}
              comparePrice={
                compare && compare > price
                  ? formatStorePrice(storefront, compare)
                  : null
              }
              discount={discount}
              imageUrl={item.featured_image_url}
              imageIndex={index}
              imageSizes="(max-width: 768px) 50vw, 25vw"
              brand={item.brand}
            />
          );
        })
      )}
    </StoreProductCardGrid>
  );
}
