"use client";

import { useMemo } from "react";
import type { PlpFacets, PlpSearchParams } from "@/lib/storefront/plp-facets";
import styles from "@/app/categories/[category]/products.module.css";

type CategoryPlpFiltersProps = {
  facets: PlpFacets;
  formatPrice: (amount: number) => string;
  params: PlpSearchParams;
  onParamsChange: (
    mutate: (current: PlpSearchParams) => PlpSearchParams,
  ) => void;
  onClearAll: () => void;
};

function parseBrands(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function CategoryPlpFilters({
  facets,
  formatPrice,
  params,
  onParamsChange,
  onClearAll,
}: CategoryPlpFiltersProps) {
  const selectedBrands = useMemo(
    () => parseBrands(params.brand),
    [params.brand],
  );

  const minPrice = params.min ?? String(facets.priceMin);
  const maxPrice = params.max ?? String(facets.priceMax);

  const toggleBrand = (brand: string) => {
    onParamsChange((current) => {
      const selected = parseBrands(current.brand);
      const next = selected.includes(brand)
        ? selected.filter((entry) => entry !== brand)
        : [...selected, brand];
      return {
        ...current,
        brand: next.length ? next.join(",") : undefined,
      };
    });
  };

  return (
    <div className={styles.filters}>
      <div className={styles.filterTitle}>
        <strong>Filter By</strong>
        <button type="button" onClick={onClearAll}>
          Clear All
        </button>
      </div>

      {facets.priceMax > facets.priceMin ? (
        <div className={styles.filterGroup}>
          <h3>Price Range</h3>
          <input
            type="range"
            min={facets.priceMin}
            max={facets.priceMax}
            value={maxPrice}
            onChange={(event) => {
              const value = event.target.value;
              onParamsChange((current) => ({
                ...current,
                max: value,
                min: current.min ?? String(facets.priceMin),
              }));
            }}
          />
          <div className={styles.rangeLabels}>
            <span>{formatPrice(Number(minPrice) || facets.priceMin)}</span>
            <span>{formatPrice(Number(maxPrice) || facets.priceMax)}</span>
          </div>
        </div>
      ) : null}

      {facets.brands.length > 0 ? (
        <div className={styles.filterGroup}>
          <h3>Brand</h3>
          {facets.brands.map((brand) => (
            <label key={brand.value}>
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand.value)}
                onChange={() => toggleBrand(brand.value)}
              />
              <span>{brand.value}</span>
              <small>({brand.count})</small>
            </label>
          ))}
        </div>
      ) : null}

      {facets.tags.length > 0 ? (
        <div className={styles.filterGroup}>
          <h3>Tags</h3>
          {facets.tags.map((tag) => (
            <label key={tag.value}>
              <input
                type="checkbox"
                checked={params.tag === tag.value}
                onChange={() => {
                  onParamsChange((current) => ({
                    ...current,
                    tag: current.tag === tag.value ? undefined : tag.value,
                  }));
                }}
              />
              <span>{tag.value}</span>
              <small>({tag.count})</small>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CategoryPlpToolbar({
  facets,
  title,
  subtitle,
  totalCount,
  filteredCount,
  params,
  onParamsChange,
}: {
  facets: PlpFacets;
  title: string;
  subtitle?: string;
  totalCount: number;
  filteredCount: number;
  params: PlpSearchParams;
  onParamsChange: (
    mutate: (current: PlpSearchParams) => PlpSearchParams,
  ) => void;
}) {
  const sort = params.sort ?? "newest";
  const activeTag = params.tag;
  const saleActive = params.sale === "1";

  const chips = [
    { id: "all", label: "All", active: !activeTag && !saleActive },
    ...(facets.onSaleCount > 0
      ? [{ id: "sale", label: "On sale", active: saleActive }]
      : []),
    ...facets.tags.map((tag) => ({
      id: tag.value,
      label: tag.value,
      active: activeTag === tag.value,
    })),
  ];

  return (
    <>
      <div className={styles.resultsHeader}>
        <div>
          <h1>{title}</h1>
          <p>
            {subtitle ??
              "Find the latest products with top features and best prices."}
          </p>
        </div>
        <div>
          <span>
            Showing {filteredCount === 0 ? 0 : 1}–{filteredCount} of {totalCount}{" "}
            products
          </span>
          <label>
            Sort by:{" "}
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(event) => {
                onParamsChange((current) => ({
                  ...current,
                  sort:
                    event.target.value === "newest"
                      ? undefined
                      : event.target.value,
                }));
              }}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
      </div>

      {chips.length > 1 ? (
        <div className={styles.chips}>
          {chips.map((chip) => (
            <button
              type="button"
              key={chip.id}
              className={chip.active ? styles.activeChip : ""}
              onClick={() => {
                onParamsChange((current) => {
                  const next: PlpSearchParams = {
                    ...current,
                    tag: undefined,
                    sale: undefined,
                  };
                  if (chip.id === "sale") next.sale = "1";
                  else if (chip.id !== "all") next.tag = chip.id;
                  return next;
                });
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
