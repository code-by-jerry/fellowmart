import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import { StoreHomeContent } from "@/components/storefront/StoreHomeContent";
import {
  getTenantDealProducts,
  getTenantFeaturedProducts,
  getTenantBrands,
} from "@/lib/catalog/storefront-queries";
import { getTenantCatalog } from "@/lib/catalog/tenant-catalog";
import { getTenantHeroBanners } from "@/lib/catalog/hero-banner-service";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { storePath } from "@/lib/routes/store-routes";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { notFound } from "next/navigation";

export default async function StoreHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeTenantSlug(rawSlug);
  const storefront = await getStorefrontContext(slug);

  if (!storefront) {
    notFound();
  }

  const [catalog, featuredProducts, dealProducts, brands, banners] = await Promise.all([
    getTenantCatalog(slug),
    getTenantFeaturedProducts(storefront.tenantId, 6),
    getTenantDealProducts(storefront.tenantId, 6),
    getTenantBrands(storefront.tenantId, 12),
    getTenantHeroBanners(storefront.tenantId, storefront.tenantSlug, storePath),
  ]);

  return (
    <TenantStoreLayout slug={slug} showCategoryNav>
      <StoreHomeContent
        storefront={storefront}
        banners={banners}
        collections={catalog?.collections ?? []}
        featuredProducts={featuredProducts}
        dealProducts={dealProducts}
        brands={brands}
      />
    </TenantStoreLayout>
  );
}
