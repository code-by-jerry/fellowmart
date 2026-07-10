import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, House } from "lucide-react";
import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import {
  formatBlogDate,
  getPublishedBlogPostBySlug,
  getPublishedBlogPosts,
  renderBlogBodyHtml,
} from "@/lib/catalog/blog-service";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { buildMetadata } from "@/lib/site-config";
import { storePath } from "@/lib/routes/store-routes";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import styles from "@/app/store/[slug]/blog/blog.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug, postSlug } = await params;
  const storefront = await getStorefrontContext(normalizeTenantSlug(rawSlug));
  if (!storefront) return {};

  const post = await getPublishedBlogPostBySlug(
    storefront.tenantId,
    postSlug,
  );
  if (!post) return {};

  return buildMetadata(storefront.settings, {
    title: post.meta_title || post.title,
    description:
      post.meta_description ||
      post.excerpt ||
      `Read ${post.title} on ${storefront.tenantName}.`,
    keywords: post.meta_keywords,
    image: post.cover_image_url,
    path: storePath(storefront.tenantSlug, `blog/${post.slug}`),
    type: "article",
  });
}

export default async function StoreBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
}) {
  const { slug: rawSlug, postSlug } = await params;
  const slug = normalizeTenantSlug(rawSlug);
  const storefront = await getStorefrontContext(slug);

  if (!storefront) notFound();

  const post = await getPublishedBlogPostBySlug(storefront.tenantId, postSlug);
  if (!post) notFound();

  const related = (await getPublishedBlogPosts(storefront.tenantId, 4)).filter(
    (item) => item.id !== post.id,
  ).slice(0, 3);

  const dateLabel = formatBlogDate(post.published_at);
  const bodyHtml = renderBlogBodyHtml(post.body || "");
  const blogHref = storePath(storefront.tenantSlug, "blog");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.cover_image_url || undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at || post.published_at || undefined,
    author: {
      "@type": "Person",
      name: post.author_name || storefront.tenantName,
    },
    publisher: {
      "@type": "Organization",
      name: storefront.tenantName,
      logo: storefront.settings.logo_url
        ? { "@type": "ImageObject", url: storefront.settings.logo_url }
        : undefined,
    },
    mainEntityOfPage: storePath(storefront.tenantSlug, `blog/${post.slug}`),
  };

  return (
    <TenantStoreLayout slug={slug}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className={styles.articlePage}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href={storefront.basePath}>
            <House size={14} aria-hidden="true" />
            Home
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link href={blogHref}>Blog</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span>{post.title}</span>
        </nav>

        <header className={styles.articleHeader}>
          <div className={styles.postMeta}>
            {dateLabel ? (
              <time dateTime={post.published_at ?? undefined}>{dateLabel}</time>
            ) : null}
            {post.author_name ? <span>{post.author_name}</span> : null}
          </div>
          <h1>{post.title}</h1>
          {post.excerpt ? <p className={styles.articleLead}>{post.excerpt}</p> : null}
        </header>

        {post.cover_image_url ? (
          <div className={styles.articleCover}>
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 860px"
              className={styles.articleCoverImage}
            />
          </div>
        ) : null}

        <div
          className={styles.articleBody}
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        <div className={styles.articleFooter}>
          <Link href={blogHref} className={styles.backLink}>
            <ArrowLeft size={16} aria-hidden="true" />
            All articles
          </Link>
          <Link href={storefront.basePath} className={styles.shopLink}>
            Shop the store
          </Link>
        </div>

        {related.length > 0 ? (
          <section className={styles.relatedSection} aria-labelledby="related-title">
            <h2 id="related-title">More from the blog</h2>
            <div className={styles.relatedGrid}>
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={storePath(storefront.tenantSlug, `blog/${item.slug}`)}
                  className={styles.relatedCard}
                >
                  <strong>{item.title}</strong>
                  {item.excerpt ? <span>{item.excerpt}</span> : null}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </TenantStoreLayout>
  );
}
