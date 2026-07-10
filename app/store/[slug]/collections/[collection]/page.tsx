import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, House } from "lucide-react";
import {
  StorePlpLayout,
  StorePlpShell,
  StorePlpSidebarFilters,
} from "@/components/storefront/StorePlpShell";
import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import { getTenantProductsByCollection } from "@/lib/catalog/storefront-queries";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { buildPlpFacets, type PlpSearchParams } from "@/lib/storefront/plp-facets";
import { toPlpProducts } from "@/lib/storefront/plp-products";
import { parsePlpSearchParams } from "@/lib/storefront/plp-url";
import {
  storeCategoriesPath,
  storeCollectionsPath,
  storeHomePath,
} from "@/lib/storefront/store-links";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import styles from "@/app/categories/[category]/products.module.css";

export default async function StoreCollectionProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; collection: string }>;
  searchParams: Promise<PlpSearchParams>;
}) {
  const { slug: rawSlug, collection: collectionSlug } = await params;
  const query = await searchParams;
  const slug = normalizeTenantSlug(rawSlug);
  const storefront = await getStorefrontContext(slug);

  if (!storefront) {
    notFound();
  }

  const catalog = await getTenantProductsByCollection(
    storefront.tenantId,
    collectionSlug,
  );

  if (!catalog) {
    notFound();
  }

  const { collection, products } = catalog;
  const title = collection.name;
  const subtitle =
    collection.description ??
    `Shop curated products from this collection at ${storefront.tenantName}.`;
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
          <Link href={storeCollectionsPath(slug)}>Collections</Link>
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
          subtitle={subtitle}
          gridClassName={styles.productGrid}
          ariaLabel={`${title} products`}
        >
          <StorePlpLayout
            sidebar={<StorePlpSidebarFilters />}
            footer={
              <p className="mt-10 text-center text-sm text-gray-500">
                <Link
                  href={storeCollectionsPath(slug)}
                  className="font-medium text-gray-900 underline"
                >
                  View all collections
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
      </div>
    </TenantStoreLayout>
  );
}
