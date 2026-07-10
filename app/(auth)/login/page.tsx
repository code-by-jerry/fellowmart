import { Suspense } from "react";
import { cookies } from "next/headers";
import { UserLoginForm } from "./UserLoginForm";
import {
  resolveCustomerStoreSlug,
  storeSlugCookieOptions,
  storeSlugFromPathname,
} from "@/lib/tenant/active-store";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { getSiteSettings } from "@/lib/site-config-server";
import { themeCssVars } from "@/lib/utils/color";

export default async function UserLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const fromNext = storeSlugFromPathname(next ?? "");
  const slug = await resolveCustomerStoreSlug(fromNext);

  if (fromNext) {
    const cookieStore = await cookies();
    const cookie = storeSlugCookieOptions(fromNext);
    cookieStore.set(cookie.name, cookie.value, cookie.options);
  }

  const storefront = await getStorefrontContext(slug);
  const platform = await getSiteSettings();
  const themeColor = storefront?.themeColor ?? platform.theme_color;

  return (
    <div className="min-h-full" style={themeCssVars(themeColor)}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          </div>
        }
      >
        <UserLoginForm />
      </Suspense>
    </div>
  );
}
