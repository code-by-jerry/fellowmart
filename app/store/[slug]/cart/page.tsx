import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import { CartPageContent } from "@/components/storefront/CartPageContent";
import { normalizeTenantSlug } from "@/lib/utils/tenant";

export default async function StoreCartPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeTenantSlug(rawSlug);

  return (
    <TenantStoreLayout slug={slug} showCategoryNav={false}>
      <CartPageContent />
    </TenantStoreLayout>
  );
}
