import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  House,
  Layers,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import { getTenantCollections } from "@/lib/catalog/storefront-queries";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
import { storeCategoriesPath, storeCollectionPath, storeCollectionsPath } from "@/lib/storefront/store-links";
import { storePath } from "@/lib/routes/store-routes";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { notFound } from "next/navigation";
import styles from "@/app/categories/categories.module.css";

const benefits = [
  { title: "Free Delivery", text: "On orders above $49", icon: Truck },
  { title: "Easy Returns", text: "30 days return policy", icon: RotateCcw },
  { title: "Secure Payment", text: "100% secure payment", icon: ShieldCheck },
  { title: "24/7 Support", text: "We're here to help", icon: Headphones },
];

export default async function StoreCollectionsPage({
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

  const collections = await getTenantCollections(storefront.tenantId);
  const base = storefront.basePath;

  return (
    <TenantStoreLayout slug={slug} showCategoryNav={false}>
      <div className={styles.page}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href={base}>
            <House /> Home
          </Link>
          <span>/</span>
          <span>Collections</span>
        </nav>

        <div className={styles.headingRow}>
          <div>
            <h1>Shop Collections</h1>
            <p>Curated product picks from {storefront.tenantName}.</p>
          </div>
          <div className={styles.topBenefits}>
            {benefits.slice(0, 3).map(({ title, text, icon: Icon }) => (
              <div key={title}>
                <Icon />
                <p>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <section className={styles.grid} aria-label="All collections">
          {collections.length === 0 ? (
            <p className="col-span-full py-12 text-center text-sm text-gray-500">
              No collections available yet.{" "}
              <Link href={storePath(slug, "categories")} className="text-primary underline">
                Browse categories
              </Link>
            </p>
          ) : (
            collections.map((collection, index) => (
              <article className={styles.card} key={collection.id}>
                <div
                  className={`${styles.image} ${index > 4 ? styles.alternateImage : ""}`}
                >
                  {collection.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={collection.image_url}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <span style={{ "--item": index % 6 } as React.CSSProperties} />
                  )}
                </div>
                <div className={styles.icon}>
                  <Layers aria-hidden="true" />
                </div>
                <div className={styles.cardBody}>
                  <h2>{collection.name}</h2>
                  <p>{collection.description ?? "Explore curated products"}</p>
                  <Link href={storeCollectionPath(slug, collection.slug)}>
                    Shop collection <ArrowRight />
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>

        <p className="mt-8 text-center text-sm text-gray-500">
          Looking for something specific?{" "}
          <Link href={storeCategoriesPath(slug)} className="font-medium text-gray-900 underline">
            Browse all categories
          </Link>
        </p>
      </div>

      <section className={styles.bottomBenefits} aria-label="Shopping benefits">
        <div>
          {benefits.map(({ title, text, icon: Icon }) => (
            <div key={title}>
              <Icon />
              <p>
                <strong>{title}</strong>
                <span>{text}</span>
              </p>
            </div>
          ))}
        </div>
      </section>
    </TenantStoreLayout>
  );
}
