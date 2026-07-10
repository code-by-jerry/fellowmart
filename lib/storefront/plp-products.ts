import type { StorefrontProduct } from "@/lib/catalog/storefront-queries";
import type { PlpProduct } from "@/lib/storefront/plp-facets";
import { categorySlugFromRelation } from "@/lib/storefront/store-links";

export type PlpProductSource = Pick<
  StorefrontProduct,
  | "id"
  | "name"
  | "slug"
  | "brand"
  | "price"
  | "compare_at_price"
  | "featured_image_url"
  | "tags"
> & {
  categories?: { slug?: string } | { slug?: string }[] | null;
  category_slug?: string | null;
};

export function toPlpProducts(products: PlpProductSource[]): PlpProduct[] {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    price: Number(product.price),
    compare_at_price: product.compare_at_price,
    featured_image_url: product.featured_image_url,
    tags: product.tags ?? [],
    category_slug:
      product.category_slug ??
      categorySlugFromRelation(product.categories) ??
      null,
  }));
}
