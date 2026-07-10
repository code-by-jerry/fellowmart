import { normalizeTenantSlug } from "@/lib/utils/tenant";

export function slugifyProductName(name: string): string {
  return normalizeTenantSlug(name);
}

export function normalizeSku(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildVariantSku(
  baseSku: string,
  attributes: Record<string, string>,
): string {
  const base = normalizeSku(baseSku);
  if (!base) return "";

  const parts = Object.entries(attributes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) =>
      value
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "")
        .slice(0, 6),
    )
    .filter(Boolean);

  return parts.length ? `${base}-${parts.join("-")}` : base;
}

export function buildVariantName(
  productName: string,
  attributes: Record<string, string>,
): string {
  const parts = Object.values(attributes).filter(Boolean);
  return parts.length ? `${productName} — ${parts.join(" / ")}` : productName;
}

export function deriveStockStatus(
  quantity: number,
  lowThreshold: number,
  allowBackorder: boolean,
): "in_stock" | "out_of_stock" | "low_stock" | "backorder" {
  if (quantity <= 0) {
    return allowBackorder ? "backorder" : "out_of_stock";
  }
  if (quantity <= lowThreshold) {
    return "low_stock";
  }
  return "in_stock";
}

export function generateBaseSku(tenantSlug: string, productName: string): string {
  const prefix = normalizeSku(tenantSlug).slice(0, 4).toUpperCase() || "FM";
  const code = productName
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 6);
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return normalizeSku(`${prefix}-${code || "PRD"}-${random}`);
}

/** Cartesian product of option value arrays for variant generation */
export function cartesianVariants<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((prefix) => curr.map((item) => [...prefix, item])),
    [[]],
  );
}

export function generateVariantsFromOptions(
  productName: string,
  baseSku: string,
  options: Array<{ name: string; values: string[] }>,
): Array<{
  name: string;
  sku: string;
  attributes: Record<string, string>;
}> {
  if (!options.length) return [];

  const axes = options.map((option) =>
    option.values.map((value) => ({
      optionName: option.name,
      value,
    })),
  );

  return cartesianVariants(axes).map((combo) => {
    const attributes = Object.fromEntries(
      combo.map((item) => [item.optionName, item.value]),
    );
    return {
      name: buildVariantName(productName, attributes),
      sku: buildVariantSku(baseSku, attributes),
      attributes,
    };
  });
}
