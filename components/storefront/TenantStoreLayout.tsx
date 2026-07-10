import { notFound } from "next/navigation";
import { after } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getTenantCategories } from "@/lib/catalog/tenant-storefront";
import { getFooterStorePages } from "@/lib/catalog/store-page-service";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { upsertTenantCustomer } from "@/lib/business/tenant-customer-upsert";
import { CustomerStoreLayout } from "./CustomerStoreLayout";

type TenantStoreLayoutProps = {
  slug: string;
  children: React.ReactNode;
  userName?: string | null;
  showCategoryNav?: boolean;
  showFooter?: boolean;
};

export async function TenantStoreLayout({
  slug: rawSlug,
  children,
  userName: userNameProp,
  showCategoryNav = false,
  showFooter = true,
}: TenantStoreLayoutProps) {
  const slug = normalizeTenantSlug(rawSlug);
  const storefront = await getStorefrontContext(slug);

  if (!storefront) {
    notFound();
  }

  let userName = userNameProp;
  if (userName === undefined) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userName = user?.email?.split("@")[0] ?? null;

    if (user?.email) {
      const email = user.email;
      after(async () => {
        await upsertTenantCustomer({
          tenantId: storefront.tenantId,
          userId: user.id,
          email,
          name:
            (user.user_metadata?.full_name as string | undefined) ??
            (user.user_metadata?.name as string | undefined) ??
            null,
          source: "visit",
        });
      });
    }
  }

  const [categories, footerPages] = await Promise.all([
    showCategoryNav
      ? getTenantCategories(storefront.tenantId)
      : Promise.resolve([]),
    showFooter
      ? getFooterStorePages(storefront.tenantId)
      : Promise.resolve([]),
  ]);

  return (
    <CustomerStoreLayout
      storefront={storefront}
      categories={categories}
      footerPages={footerPages}
      userName={userName}
      showCategoryNav={showCategoryNav}
      showFooter={showFooter}
    >
      {children}
    </CustomerStoreLayout>
  );
}
