import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, House } from "lucide-react";
import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import {
  formatBlogDate,
  getPublishedBlogPosts,
} from "@/lib/catalog/blog-service";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { buildMetadata } from "@/lib/site-config";
import { storePath } from "@/lib/routes/store-routes";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import styles from "@/app/store/[slug]/blog/blog.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const storefront = await getStorefrontContext(normalizeTenantSlug(rawSlug));
  if (!storefront) return {};

  return buildMetadata(storefront.settings, {
    title: `Blog`,
    description: `Tips, stories, and updates from ${storefront.tenantName}.`,
    path: storePath(storefront.tenantSlug, "blog"),
    type: "website",
  });
}

export default async function StoreBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeTenantSlug(rawSlug);
  const storefront = await getStorefrontContext(slug);

  if (!storefront) notFound();

  const posts = await getPublishedBlogPosts(storefront.tenantId, 48);

  return (
    <TenantStoreLayout slug={slug}>
      <div className={styles.blogPage}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href={storefront.basePath}>
            <House size={14} aria-hidden="true" />
            Home
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span>Blog</span>
        </nav>

        <header className={styles.blogHeader}>
          <p className={styles.eyebrow}>From {storefront.tenantName}</p>
          <h1>Blog</h1>
          <p>
            Guides, product stories, and store updates — written to help you
            shop smarter.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No articles published yet. Check back soon.</p>
            <Link href={storefront.basePath}>
              Continue shopping <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className={styles.postGrid}>
            {posts.map((post) => {
              const dateLabel = formatBlogDate(post.published_at);
              return (
                <article key={post.id} className={styles.postCard}>
                  <Link
                    href={storePath(storefront.tenantSlug, `blog/${post.slug}`)}
                    className={styles.postCardLink}
                  >
                    <div className={styles.postCover}>
                      {post.cover_image_url ? (
                        <Image
                          src={post.cover_image_url}
                          alt=""
                          fill
                          sizes="(max-width: 760px) 100vw, 420px"
                          className={styles.postCoverImage}
                        />
                      ) : (
                        <span className={styles.postCoverFallback} />
                      )}
                    </div>
                    <div className={styles.postBody}>
                      <div className={styles.postMeta}>
                        {dateLabel ? <time dateTime={post.published_at ?? undefined}>{dateLabel}</time> : null}
                        {post.author_name ? <span>{post.author_name}</span> : null}
                      </div>
                      <h2>{post.title}</h2>
                      {post.excerpt ? <p>{post.excerpt}</p> : null}
                      <span className={styles.readMore}>
                        Read article <ArrowRight size={14} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </TenantStoreLayout>
  );
}
