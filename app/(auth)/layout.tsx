import { themeCssVars } from "@/lib/utils/color";
import { resolveCustomerStoreSlug } from "@/lib/tenant/active-store";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { getSiteSettings } from "@/lib/site-config-server";

/** Applies the active store's primary color to customer auth screens. */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const slug = await resolveCustomerStoreSlug();
  const storefront = await getStorefrontContext(slug);
  const platform = await getSiteSettings();
  const themeColor = storefront?.themeColor ?? platform.theme_color;

  return (
    <div className="min-h-full" style={themeCssVars(themeColor)}>
      {children}
    </div>
  );
}
