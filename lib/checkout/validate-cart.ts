import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateShippingInr } from "@/lib/checkout/shipping";
import type {
  CheckoutCartLineInput,
  ValidatedCheckoutCart,
  ValidatedCheckoutLine,
} from "@/lib/checkout/types";
import { variantLabel } from "@/lib/storefront/resolve-variant";
import { categorySlugFromRelation } from "@/lib/storefront/store-links";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  featured_image_url?: string | null;
  is_active?: boolean;
  categories?: { slug?: string } | { slug?: string }[] | null;
};

type VariantRow = {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  attributes: Record<string, string> | null;
  price?: number | null;
  image_url?: string | null;
  stock_quantity?: number | null;
  allow_backorder?: boolean | null;
  is_active?: boolean | null;
};

export class CheckoutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutValidationError";
  }
}

function resolveVariantForLine(
  product: ProductRow,
  variants: VariantRow[],
  requestedVariantId?: string | null,
): VariantRow {
  const active = variants.filter((variant) => variant.is_active !== false);
  if (!active.length) {
    throw new CheckoutValidationError(
      `${product.name} is not available for purchase.`,
    );
  }

  if (requestedVariantId) {
    const match = active.find((variant) => variant.id === requestedVariantId);
    if (!match) {
      throw new CheckoutValidationError(
        `Selected variant for ${product.name} is no longer available.`,
      );
    }
    return match;
  }

  if (active.length === 1) {
    return active[0];
  }

  throw new CheckoutValidationError(
    `Please select a variant for ${product.name} before checkout.`,
  );
}

export async function validateCheckoutCart(
  supabase: SupabaseClient,
  tenantId: string,
  lines: CheckoutCartLineInput[],
): Promise<ValidatedCheckoutCart> {
  if (!lines.length) {
    throw new CheckoutValidationError("Your cart is empty.");
  }

  const normalized = lines
    .map((line) => ({
      productId: line.productId?.trim(),
      variantId: line.variantId?.trim() || null,
      quantity: Math.floor(Number(line.quantity) || 0),
    }))
    .filter((line) => line.productId && line.quantity > 0);

  if (!normalized.length) {
    throw new CheckoutValidationError("Your cart is empty.");
  }

  const productIds = [...new Set(normalized.map((line) => line.productId))];

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, name, slug, price, featured_image_url, is_active, categories(slug)",
    )
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .in("id", productIds);

  if (productsError) {
    throw new Error("Could not validate cart items.");
  }

  const productMap = new Map(
    (products ?? []).map((row) => [row.id as string, row as ProductRow]),
  );

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select(
      "id, product_id, name, sku, attributes, price, image_url, stock_quantity, allow_backorder, is_active",
    )
    .in("product_id", productIds);

  if (variantsError) {
    throw new Error("Could not validate product variants.");
  }

  const variantsByProduct = new Map<string, VariantRow[]>();
  for (const row of variants ?? []) {
    const productId = row.product_id as string;
    const list = variantsByProduct.get(productId) ?? [];
    list.push(row as VariantRow);
    variantsByProduct.set(productId, list);
  }

  const validatedLines: ValidatedCheckoutLine[] = [];

  for (const line of normalized) {
    const product = productMap.get(line.productId);
    if (!product) {
      throw new CheckoutValidationError(
        "One or more products in your cart are no longer available.",
      );
    }

    const productVariants = variantsByProduct.get(line.productId) ?? [];
    const variant = resolveVariantForLine(
      product,
      productVariants,
      line.variantId,
    );

    const stock = Number(variant.stock_quantity ?? 0);
    const allowBackorder = Boolean(variant.allow_backorder);
    if (!allowBackorder && stock < line.quantity) {
      throw new CheckoutValidationError(
        stock <= 0
          ? `${product.name} is out of stock.`
          : `Only ${stock} left in stock for ${product.name}.`,
      );
    }

    const unitPriceInr = Number(variant.price ?? product.price) || 0;
    if (unitPriceInr <= 0) {
      throw new CheckoutValidationError(
        `${product.name} cannot be purchased right now.`,
      );
    }

    const attrs = (variant.attributes ?? {}) as Record<string, string>;
    const label = variantLabel(attrs);

    validatedLines.push({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantName: variant.name,
      variantLabel: label,
      imageUrl: variant.image_url ?? product.featured_image_url ?? null,
      quantity: line.quantity,
      unitPriceInr,
      lineTotalInr: unitPriceInr * line.quantity,
      slug: product.slug,
      categorySlug: categorySlugFromRelation(product.categories),
    });
  }

  const subtotalInr = validatedLines.reduce(
    (sum, line) => sum + line.lineTotalInr,
    0,
  );
  const shippingInr = calculateShippingInr(subtotalInr);

  return {
    lines: validatedLines,
    subtotalInr,
    shippingInr,
    taxInr: 0,
    discountInr: 0,
    totalInr: subtotalInr + shippingInr,
  };
}
