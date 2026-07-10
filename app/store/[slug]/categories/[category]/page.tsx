import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown, ChevronRight, House } from "lucide-react";
import {
  StorePlpLayout,
  StorePlpShell,
  StorePlpSidebarFilters,
} from "@/components/storefront/StorePlpShell";
import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import { getTenantProductsByCategory } from "@/lib/catalog/storefront-queries";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { buildPlpFacets } from "@/lib/storefront/plp-facets";
import { toPlpProducts } from "@/lib/storefront/plp-products";
import { parsePlpSearchParams } from "@/lib/storefront/plp-url";
import type { PlpSearchParams } from "@/lib/storefront/plp-facets";
import {
  storeCategoriesPath,
  storeCategoryPath,
  storeHomePath,
} from "@/lib/storefront/store-links";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import styles from "@/app/categories/[category]/products.module.css";

export default async function StoreCategoryProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; category: string }>;
  searchParams: Promise<PlpSearchParams>;
}) {
  const { slug: rawSlug, category: categorySlug } = await params;
  const query = await searchParams;
  const slug = normalizeTenantSlug(rawSlug);
  const storefront = await getStorefrontContext(slug);

  if (!storefront) {
    notFound();
  }

  const catalog = await getTenantProductsByCategory(
    storefront.tenantId,
    categorySlug,
  );

  if (!catalog) {
    notFound();
  }

  const { category, products, allCategories } = catalog;
  const title = category.name;
  const plpSource = toPlpProducts(products);
  const facets = buildPlpFacets(plpSource);
  const initialParams = parsePlpSearchParams(query);

  return (
    <TenantStoreLayout slug={slug} showCategoryNav={false}>
      <div className={styles.page}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href={storeHomePath(slug)}>
            <House /> Home
          </Link>
          <ChevronRight />
          <Link href={storeCategoriesPath(slug)}>Categories</Link>
          <ChevronRight />
          <span>{title}</span>
        </nav>

        <StorePlpShell
          products={plpSource}
          facets={facets}
          initialParams={initialParams}
          tenantSlug={slug}
          storefront={storefront}
          title={title}
          categorySlug={categorySlug}
          gridClassName={styles.productGrid}
          ariaLabel={`${title} products`}
        >
          <StorePlpLayout
            sidebar={
              <>
                <div className={styles.categoryMenu}>
                  <h2>Categories</h2>
                  <strong>
                    {title} <ChevronDown />
                  </strong>
                  {allCategories.map((item) => (
                    <Link
                      className={
                        item.slug === categorySlug ? styles.selected : ""
                      }
                      href={storeCategoryPath(slug, item.slug)}
                      key={item.id}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <StorePlpSidebarFilters />
              </>
            }
          />
        </StorePlpShell>
      </div>
    </TenantStoreLayout>
  );
}
