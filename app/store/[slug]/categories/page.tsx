import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  House,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import {
  getCategoryIcon,
  getCategorySpriteIndex,
} from "@/lib/catalog/category-display";
import { getTenantCategories } from "@/lib/catalog/tenant-storefront";
import { getStorefrontContext } from "@/lib/tenant/storefront-context";
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

export default async function StoreCategoriesPage({
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

  const categories = await getTenantCategories(storefront.tenantId);
  const base = storefront.basePath;

  return (
    <TenantStoreLayout slug={slug} showCategoryNav={false}>
      <div className={styles.page}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href={base}>
            <House /> Home
          </Link>
          <span>/</span>
          <span>Shop by Category</span>
        </nav>

        <div className={styles.headingRow}>
          <div>
            <h1>Shop by Category</h1>
            <p>Explore top categories at {storefront.tenantName}.</p>
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

        <section className={styles.grid} aria-label="All product categories">
          {categories.length === 0 ? (
            <p className="col-span-full py-12 text-center text-sm text-gray-500">
              No categories available yet.
            </p>
          ) : (
            categories.map((category, index) => {
              const Icon = getCategoryIcon(category.icon_name);
              const spriteIndex = getCategorySpriteIndex(category.slug, index % 6);

              return (
                <article className={styles.card} key={category.id}>
                  <div
                    className={`${styles.image} ${index > 4 ? styles.alternateImage : ""}`}
                  >
                    <span style={{ "--item": spriteIndex } as React.CSSProperties} />
                  </div>
                  <div className={styles.icon}>
                    <Icon aria-hidden="true" />
                  </div>
                  <div className={styles.cardBody}>
                    <h2>{category.name}</h2>
                    <p>{category.product_count_text ?? "Explore products"}</p>
                    <Link href={storePath(slug, `categories/${category.slug}`)}>
                      Explore <ArrowRight />
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </section>
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
