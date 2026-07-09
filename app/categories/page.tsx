import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  House,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { CustomerStoreLayout } from "@/components/storefront/CustomerStoreLayout";
import { createClient } from "@/utils/supabase/server";
import {
  getCategoryIcon,
  getCategorySpriteIndex,
} from "@/lib/catalog/category-display";
import { getMarketplaceCategories } from "@/lib/catalog/marketplace-catalog";
import styles from "./categories.module.css";

const benefits = [
  { title: "Free Delivery", text: "On orders above $49", icon: Truck },
  { title: "Easy Returns", text: "30 days return policy", icon: RotateCcw },
  { title: "Secure Payment", text: "100% secure payment", icon: ShieldCheck },
  { title: "24/7 Support", text: "We're here to help", icon: Headphones },
];

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userName = user?.email?.split("@")[0] ?? null;
  const categories = await getMarketplaceCategories();

  return (
    <CustomerStoreLayout userName={userName} showCategoryNav={false}>
      <div className={styles.page}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/">
            <House /> Home
          </Link>
          <span>/</span>
          <span>Shop by Category</span>
        </nav>

        <div className={styles.headingRow}>
          <div>
            <h1>Shop by Category</h1>
            <p>Explore top categories and find exactly what you need.</p>
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
            <p className="col-span-full text-center text-sm text-gray-500 py-12">
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
                    <Link href={`/categories/${category.slug}`}>
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
    </CustomerStoreLayout>
  );
}
