import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import { CheckoutPageContent } from "@/components/storefront/CheckoutPageContent";
import { createClient } from "@/utils/supabase/server";
import { isRazorpayEnabled } from "@/lib/payments/razorpay-config";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import type { CustomerAddress } from "@/lib/types/customer";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { notFound } from "next/navigation";

export default async function StoreCheckoutPage({
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let savedAddresses: CustomerAddress[] = [];
  let defaultEmail: string | null = user?.email ?? null;
  let defaultName: string | null = null;
  let defaultPhone: string | null = null;

  if (user) {
    const [{ data: profile }, { data: addresses }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("customer_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

    defaultName =
      profile?.full_name ??
      (typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null);
    defaultPhone = profile?.phone ?? null;
    savedAddresses = (addresses ?? []) as CustomerAddress[];
  }

  return (
    <TenantStoreLayout slug={slug} showCategoryNav={false}>
      <CheckoutPageContent
        savedAddresses={savedAddresses}
        defaultEmail={defaultEmail}
        defaultName={defaultName}
        defaultPhone={defaultPhone}
        isLoggedIn={Boolean(user)}
        onlinePaymentsEnabled={isRazorpayEnabled()}
        storeName={storefront.tenantName}
      />
    </TenantStoreLayout>
  );
}
