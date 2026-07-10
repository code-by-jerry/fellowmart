import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, House } from "lucide-react";
import {
  StorePlpLayout,
  StorePlpShell,
  StorePlpSidebarFilters,
} from "@/components/storefront/StorePlpShell";
import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import { searchTenantProducts } from "@/lib/catalog/storefront-queries";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { buildPlpFacets, type PlpSearchParams } from "@/lib/storefront/plp-facets";
import { toPlpProducts } from "@/lib/storefront/plp-products";
import { parsePlpSearchParams } from "@/lib/storefront/plp-url";
import {
  storeCategoriesPath,
  storeHomePath,
  storeSearchPath,
} from "@/lib/storefront/store-links";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import styles from "@/app/categories/[category]/products.module.css";

export default async function StoreSearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<PlpSearchParams>;
}) {
  const { slug: rawSlug } = await params;
  const query = await searchParams;
  const slug = normalizeTenantSlug(rawSlug);
  const storefront = await getStorefrontContext(slug);

  if (!storefront) {
    notFound();
  }

  const searchTerm = query.q?.trim() ?? "";
  const products = searchTerm
    ? await searchTenantProducts(storefront.tenantId, searchTerm)
    : [];
  const plpSource = toPlpProducts(products);
  const facets = buildPlpFacets(plpSource);
  const initialParams = parsePlpSearchParams(query);
  const title = searchTerm ? `Search: "${searchTerm}"` : "Search";
  const subtitle = searchTerm
    ? `Results for "${searchTerm}"`
    : "Enter a search term in the header to find products.";

  return (
    <TenantStoreLayout slug={slug} showCategoryNav={false}>
      <div className={styles.page}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href={storeHomePath(slug)}>
            <House /> Home
          </Link>
          <ChevronRight />
          <span>Search</span>
        </nav>

        {searchTerm ? (
          <StorePlpShell
            products={plpSource}
            facets={facets}
            initialParams={initialParams}
            tenantSlug={slug}
            storefront={storefront}
            title={title}
            subtitle={subtitle}
            gridClassName={styles.productGrid}
            ariaLabel="Search results"
            emptyMessage={`No products found for "${searchTerm}".`}
          >
            <StorePlpLayout
              sidebar={<StorePlpSidebarFilters />}
              footer={
                <p className="mt-10 text-center text-sm text-gray-500">
                  <Link
                    href={storeSearchPath(slug)}
                    className="font-medium text-gray-900 underline"
                  >
                    Clear search
                  </Link>
                  {" · "}
                  <Link
                    href={storeCategoriesPath(slug)}
                    className="font-medium text-gray-900 underline"
                  >
                    Browse categories
                  </Link>
                </p>
              }
            />
          </StorePlpShell>
        ) : (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <div>
                <h1>{title}</h1>
                <p>{subtitle}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Use the search bar above to look up products, brands, SKUs, or
              tags.
            </p>
          </div>
        )}
      </div>
    </TenantStoreLayout>
  );
}
