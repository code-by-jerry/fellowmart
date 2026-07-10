"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ListFilter } from "lucide-react";
import {
  CategoryPlpFilters,
  CategoryPlpToolbar,
} from "@/components/storefront/CategoryPlpControls";
import { StorePlpProductGrid } from "@/components/storefront/StorePlpProductGrid";
import { useStoreCommerce } from "@/components/storefront/StoreCommerceProvider";
import {
  applyPlpFilters,
  sortPlpProducts,
  type PlpFacets,
  type PlpProduct,
  type PlpSearchParams,
} from "@/lib/storefront/plp-facets";
import {
  clearPlpFilterParams,
  parsePlpSearchParams,
  syncPlpParamsToUrl,
} from "@/lib/storefront/plp-url";
import type { StorefrontPricing } from "@/lib/storefront/pricing";
import styles from "@/app/categories/[category]/products.module.css";

type StorePlpContextValue = {
  products: PlpProduct[];
  facets: PlpFacets;
  params: PlpSearchParams;
  setParams: (next: PlpSearchParams) => void;
  updateParams: (
    mutate: (current: PlpSearchParams) => PlpSearchParams,
  ) => void;
  clearFilters: () => void;
  filteredProducts: PlpProduct[];
  totalCount: number;
  filteredCount: number;
  tenantSlug: string;
  storefront: StorefrontPricing;
  categorySlug?: string | null;
  title: string;
  subtitle?: string;
  gridClassName?: string;
  emptyMessage: string;
  ariaLabel: string;
  showMobileFilters: boolean;
};

const StorePlpContext = createContext<StorePlpContextValue | null>(null);

function useStorePlp() {
  const value = useContext(StorePlpContext);
  if (!value) {
    throw new Error("StorePlp components must be used within StorePlpShell");
  }
  return value;
}

type StorePlpShellProps = {
  products: PlpProduct[];
  facets: PlpFacets;
  initialParams: PlpSearchParams;
  tenantSlug: string;
  storefront: StorefrontPricing;
  title: string;
  subtitle?: string;
  categorySlug?: string | null;
  gridClassName?: string;
  emptyMessage?: string;
  ariaLabel: string;
  showMobileFilters?: boolean;
  children?: ReactNode;
};

export function StorePlpShell({
  products,
  facets,
  initialParams,
  tenantSlug,
  storefront,
  title,
  subtitle,
  categorySlug,
  gridClassName,
  emptyMessage = "No products match your filters.",
  ariaLabel,
  showMobileFilters = true,
  children,
}: StorePlpShellProps) {
  const [params, setParamsState] = useState<PlpSearchParams>(initialParams);

  const setParams = useCallback((next: PlpSearchParams) => {
    setParamsState(next);
    syncPlpParamsToUrl(next);
  }, []);

  const updateParams = useCallback(
    (mutate: (current: PlpSearchParams) => PlpSearchParams) => {
      setParamsState((current) => {
        const next = mutate(current);
        syncPlpParamsToUrl(next);
        return next;
      });
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setParamsState((current) => {
      const next = clearPlpFilterParams(current);
      syncPlpParamsToUrl(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setParamsState(parsePlpSearchParams(window.location.search));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const filteredProducts = useMemo(
    () =>
      sortPlpProducts(applyPlpFilters(products, params), params.sort),
    [products, params],
  );

  const value = useMemo<StorePlpContextValue>(
    () => ({
      products,
      facets,
      params,
      setParams,
      updateParams,
      clearFilters,
      filteredProducts,
      totalCount: products.length,
      filteredCount: filteredProducts.length,
      tenantSlug,
      storefront,
      categorySlug,
      title,
      subtitle,
      gridClassName,
      emptyMessage,
      ariaLabel,
      showMobileFilters,
    }),
    [
      products,
      facets,
      params,
      setParams,
      updateParams,
      clearFilters,
      filteredProducts,
      tenantSlug,
      storefront,
      categorySlug,
      title,
      subtitle,
      gridClassName,
      emptyMessage,
      ariaLabel,
      showMobileFilters,
    ],
  );

  return (
    <StorePlpContext.Provider value={value}>{children}</StorePlpContext.Provider>
  );
}

function StorePlpFiltersPanel() {
  const { facets, params, updateParams, clearFilters } = useStorePlp();
  const { formatPrice } = useStoreCommerce();

  return (
    <CategoryPlpFilters
      facets={facets}
      formatPrice={formatPrice}
      params={params}
      onParamsChange={updateParams}
      onClearAll={clearFilters}
    />
  );
}

export function StorePlpSidebarFilters() {
  return <StorePlpFiltersPanel />;
}

export function StorePlpMain({ footer }: { footer?: ReactNode }) {
  const {
    facets,
    params,
    updateParams,
    filteredProducts,
    totalCount,
    filteredCount,
    tenantSlug,
    storefront,
    categorySlug,
    title,
    subtitle,
    gridClassName,
    emptyMessage,
    ariaLabel,
    showMobileFilters,
  } = useStorePlp();

  return (
    <main className={styles.results}>
      <CategoryPlpToolbar
        facets={facets}
        title={title}
        subtitle={subtitle}
        totalCount={totalCount}
        filteredCount={filteredCount}
        params={params}
        onParamsChange={updateParams}
      />

      {showMobileFilters ? (
        <details className={styles.mobileFilters}>
          <summary>
            <ListFilter /> Filters
          </summary>
          <StorePlpFiltersPanel />
        </details>
      ) : null}

      <StorePlpProductGrid
        products={filteredProducts}
        tenantSlug={tenantSlug}
        storefront={storefront}
        categorySlug={categorySlug}
        gridClassName={gridClassName}
        emptyMessage={emptyMessage}
        ariaLabel={ariaLabel}
      />
      {footer}
    </main>
  );
}

export function StorePlpLayout({
  sidebar,
  footer,
}: {
  sidebar?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className={styles.layout}>
      {sidebar ? <aside className={styles.sidebar}>{sidebar}</aside> : null}
      <StorePlpMain footer={footer} />
    </div>
  );
}
