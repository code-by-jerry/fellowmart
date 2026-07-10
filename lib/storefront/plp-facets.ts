export type PlpProduct = {
  id: string;
  name: string;
  slug: string;
  brand?: string | null;
  price: number;
  compare_at_price?: number | null;
  featured_image_url?: string | null;
  tags?: string[] | null;
  category_slug?: string | null;
};

export type PlpFacetBrand = {
  value: string;
  count: number;
};

export type PlpFacetTag = {
  value: string;
  count: number;
};

export type PlpFacets = {
  brands: PlpFacetBrand[];
  tags: PlpFacetTag[];
  priceMin: number;
  priceMax: number;
  onSaleCount: number;
};

export type PlpSearchParams = {
  q?: string;
  sort?: string;
  brand?: string;
  tag?: string;
  sale?: string;
  min?: string;
  max?: string;
};

export function buildPlpFacets(products: PlpProduct[]): PlpFacets {
  const brandMap = new Map<string, number>();
  const tagMap = new Map<string, number>();
  const prices: number[] = [];
  let onSaleCount = 0;

  for (const product of products) {
    const price = Number(product.price) || 0;
    prices.push(price);

    if (
      product.compare_at_price != null &&
      Number(product.compare_at_price) > price
    ) {
      onSaleCount += 1;
    }

    const brand = product.brand?.trim();
    if (brand) {
      brandMap.set(brand, (brandMap.get(brand) ?? 0) + 1);
    }

    for (const rawTag of product.tags ?? []) {
      const tag = String(rawTag).trim();
      if (!tag) continue;
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
  }

  const sortedBrands = [...brandMap.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));

  const sortedTags = [...tagMap.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));

  const priceMin = prices.length ? Math.min(...prices) : 0;
  const priceMax = prices.length ? Math.max(...prices) : 0;

  return {
    brands: sortedBrands,
    tags: sortedTags.slice(0, 12),
    priceMin,
    priceMax,
    onSaleCount,
  };
}

function parseBrandFilter(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function applyPlpFilters(
  products: PlpProduct[],
  params: PlpSearchParams,
): PlpProduct[] {
  const brands = parseBrandFilter(params.brand);
  const tag = params.tag?.trim();
  const saleOnly = params.sale === "1";
  const min = params.min ? Number(params.min) : null;
  const max = params.max ? Number(params.max) : null;

  return products.filter((product) => {
    const price = Number(product.price) || 0;

    if (brands.length && (!product.brand || !brands.includes(product.brand))) {
      return false;
    }

    if (tag && !(product.tags ?? []).includes(tag)) {
      return false;
    }

    if (saleOnly) {
      const compare = product.compare_at_price;
      if (compare == null || Number(compare) <= price) return false;
    }

    if (min != null && !Number.isNaN(min) && price < min) return false;
    if (max != null && !Number.isNaN(max) && price > max) return false;

    return true;
  });
}

export function sortPlpProducts(
  products: PlpProduct[],
  sort?: string,
): PlpProduct[] {
  const list = [...products];

  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => Number(a.price) - Number(b.price));
    case "price-desc":
      return list.sort((a, b) => Number(b.price) - Number(a.price));
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
    default:
      return list;
  }
}

export function buildPlpChips(facets: PlpFacets) {
  const chips: Array<{ id: string; label: string; type: "all" | "sale" | "tag" }> =
    [{ id: "all", label: "All", type: "all" }];

  if (facets.onSaleCount > 0) {
    chips.push({ id: "sale", label: "On sale", type: "sale" });
  }

  for (const tag of facets.tags) {
    chips.push({ id: `tag:${tag.value}`, label: tag.value, type: "tag" });
  }

  return chips;
}
