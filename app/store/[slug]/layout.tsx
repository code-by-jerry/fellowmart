import { notFound } from "next/navigation";
import type { Metadata, Viewport } from "next";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { buildMetadata, buildViewport } from "@/lib/site-config";
import { themeCssVars } from "@/lib/utils/color";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const storefront = await getStorefrontContext(normalizeTenantSlug(rawSlug));
  if (!storefront) return {};
  return buildMetadata(storefront.settings);
}

export async function generateViewport({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Viewport> {
  const { slug: rawSlug } = await params;
  const storefront = await getStorefrontContext(normalizeTenantSlug(rawSlug));
  if (!storefront) return {};
  return buildViewport(storefront.settings);
}

/** Validates tenant exists and scopes theme CSS vars to this store. */
export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeTenantSlug(rawSlug);
  const storefront = await getStorefrontContext(slug);

  if (!storefront) {
    notFound();
  }

  return (
    <div style={themeCssVars(storefront.themeColor)} className="min-h-full">
      {children}
    </div>
  );
}
