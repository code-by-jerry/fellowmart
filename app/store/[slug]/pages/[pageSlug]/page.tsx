import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, House } from "lucide-react";
import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import { getPublishedStorePageBySlug } from "@/lib/catalog/store-page-service";
import { renderRichTextHtml } from "@/lib/content/rich-text";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { buildMetadata } from "@/lib/site-config";
import { storePath } from "@/lib/routes/store-routes";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import styles from "@/app/store/[slug]/pages/page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug, pageSlug } = await params;
  const storefront = await getStorefrontContext(normalizeTenantSlug(rawSlug));
  if (!storefront) return {};

  const page = await getPublishedStorePageBySlug(
    storefront.tenantId,
    pageSlug,
  );
  if (!page) return {};

  return buildMetadata(storefront.settings, {
    title: page.meta_title || page.title,
    description:
      page.meta_description ||
      `${page.title} — ${storefront.tenantName}`,
    path: storePath(storefront.tenantSlug, `pages/${page.slug}`),
    type: "website",
  });
}

export default async function StoreCustomPage({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
}) {
  const { slug: rawSlug, pageSlug } = await params;
  const slug = normalizeTenantSlug(rawSlug);
  const storefront = await getStorefrontContext(slug);

  if (!storefront) notFound();

  const page = await getPublishedStorePageBySlug(
    storefront.tenantId,
    pageSlug,
  );
  if (!page) notFound();

  const bodyHtml = renderRichTextHtml(page.body || "");

  return (
    <TenantStoreLayout slug={slug}>
      <article className={styles.pageShell}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href={storefront.basePath}>
            <House size={14} aria-hidden="true" />
            Home
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span>{page.title}</span>
        </nav>

        <header className={styles.pageHeader}>
          <h1>{page.title}</h1>
        </header>

        <div
          className={styles.pageBody}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </article>
    </TenantStoreLayout>
  );
}
