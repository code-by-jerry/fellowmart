import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import { CheckoutPaymentCallback } from "@/components/storefront/CheckoutPaymentCallback";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { normalizeTenantSlug } from "@/lib/utils/tenant";

export default async function StoreCheckoutPaymentCallbackPage({
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

  return (
    <TenantStoreLayout slug={slug} showCategoryNav={false}>
      <Suspense
        fallback={
          <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">Confirming your payment…</p>
          </div>
        }
      >
        <CheckoutPaymentCallback tenantSlug={slug} />
      </Suspense>
    </TenantStoreLayout>
  );
}
