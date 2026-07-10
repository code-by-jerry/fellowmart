export type StorefrontVariant = {
  id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price?: number | null;
  compare_at_price?: number | null;
  image_url?: string | null;
  stock_quantity?: number | null;
  is_active?: boolean;
};

export type StorefrontOptionValue = {
  id: string;
  value: string;
  position: number;
  swatch_color?: string | null;
  swatch_image_url?: string | null;
};

export type StorefrontOption = {
  id: string;
  name: string;
  position: number;
  values: StorefrontOptionValue[];
};

/** Build initial option selection from the first active variant or option defaults. */
export function initialVariantSelection(
  options: StorefrontOption[],
  variants: StorefrontVariant[],
): Record<string, string> {
  const firstVariant = variants.find((variant) => variant.is_active !== false);
  if (firstVariant?.attributes && Object.keys(firstVariant.attributes).length) {
    return { ...firstVariant.attributes };
  }

  const selection: Record<string, string> = {};
  for (const option of options) {
    const firstValue = option.values[0];
    if (firstValue?.value) {
      selection[option.name] = firstValue.value;
    }
  }
  return selection;
}

/** Resolve the best-matching variant for the current option selection. */
export function resolveVariant(
  variants: StorefrontVariant[],
  selected: Record<string, string>,
): StorefrontVariant | null {
  const active = variants.filter((variant) => variant.is_active !== false);
  if (!active.length) return null;

  const selectedEntries = Object.entries(selected).filter(([, value]) => value);
  if (!selectedEntries.length) return active[0];

  const exact = active.find((variant) =>
    selectedEntries.every(([key, value]) => variant.attributes[key] === value),
  );
  if (exact) return exact;

  let best: StorefrontVariant | null = null;
  let bestScore = -1;
  for (const variant of active) {
    const score = selectedEntries.filter(
      ([key, value]) => variant.attributes[key] === value,
    ).length;
    if (score > bestScore) {
      bestScore = score;
      best = variant;
    }
  }
  return best;
}

export function variantLabel(attributes: Record<string, string>): string | null {
  const parts = Object.values(attributes).filter(Boolean);
  return parts.length ? parts.join(" / ") : null;
}

/** Unique gallery image URLs: featured first, then variant images. */
export function buildProductGalleryImages(
  featuredImageUrl: string | null | undefined,
  variants: StorefrontVariant[],
): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const push = (url: string | null | undefined) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    urls.push(url);
  };

  push(featuredImageUrl);
  for (const variant of variants) {
    push(variant.image_url);
  }

  return urls;
}

export function cartLineKey(productId: string, variantId?: string | null): string {
  return variantId ? `${productId}:${variantId}` : productId;
}
