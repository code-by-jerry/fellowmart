import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown, ChevronRight, Heart, House, ListFilter, ShoppingCart } from "lucide-react";
import { CustomerStoreLayout } from "@/components/storefront/CustomerStoreLayout";
import { createClient } from "@/utils/supabase/server";
import { getMarketplaceCategories, getMarketplaceCategoryBySlug } from "@/lib/catalog/marketplace-catalog";
import styles from "./products.module.css";

const products: [string, string, string, string, string, number][] = [
  ["Apple iPhone 15 (128GB)", "$799.00", "$899.00", "4.7", "256", 0],
  ["Samsung Galaxy S23 (256GB)", "$699.00", "$849.00", "4.6", "198", 1],
  ["OnePlus 11R 5G (128GB)", "$499.00", "$599.00", "4.5", "142", 2],
  ["Xiaomi 13 Pro 5G (256GB)", "$649.00", "$799.00", "4.4", "98", 3],
  ["Google Pixel 7a (128GB)", "$449.00", "$549.00", "4.3", "76", 4],
  ["Samsung Galaxy A54 5G", "$349.00", "$449.00", "4.2", "112", 5],
  ["Realme GT Neo 5 (256GB)", "$499.00", "$599.00", "4.6", "64", 0],
  ["iQOO Neo 7 5G (128GB)", "$389.00", "$469.00", "4.4", "88", 3],
];

const filterGroups = [
  { title: "Brand", values: [["Apple", "32"], ["Samsung", "28"], ["OnePlus", "18"], ["Xiaomi", "24"], ["Google", "12"]] },
  { title: "Storage Capacity", values: [["64 GB", "18"], ["128 GB", "32"], ["256 GB", "40"], ["512 GB", "22"], ["1 TB", "6"]] },
];

function Filters() {
  return <div className={styles.filters}>
    <div className={styles.filterTitle}><strong>Filter By</strong><button>Clear All</button></div>
    <div className={styles.filterGroup}><h3>Price Range</h3><input type="range" min="100" max="1500" defaultValue="1500" /><div className={styles.rangeLabels}><span>$100</span><span>$1500+</span></div></div>
    {filterGroups.map((group) => <div className={styles.filterGroup} key={group.title}><h3>{group.title}</h3>{group.values.map(([value, count]) => <label key={value}><input type="checkbox" /><span>{value}</span><small>({count})</small></label>)}<button className={styles.more}>+ View More</button></div>)}
    <div className={styles.filterGroup}><h3>Customer Rating</h3>{[["★★★★★", "120"], ["★★★★☆", "84"], ["★★★☆☆", "46"], ["★★☆☆☆", "18"]].map(([stars, count]) => <label key={stars}><input type="checkbox" /><span className={styles.stars}>{stars}</span><small>({count})</small></label>)}</div>
  </div>;
}

export default async function ProductListPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const categoryRecord = await getMarketplaceCategoryBySlug(categorySlug);

  if (!categoryRecord) {
    notFound();
  }

  const title = categoryRecord.name;
  const allCategories = await getMarketplaceCategories();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.email?.split("@")[0] ?? null;

  return <CustomerStoreLayout userName={userName} showCategoryNav={false}>
    <div className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/"><House /> Home</Link><ChevronRight /><Link href="/categories">Categories</Link><ChevronRight /><span>{title}</span></nav>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.categoryMenu}><h2>Categories</h2><strong>{title} <ChevronDown /></strong>{allCategories.map((item) => <Link className={item.slug === categorySlug ? styles.selected : ""} href={`/categories/${item.slug}`} key={item.id}>{item.name}</Link>)}</div>
          <Filters />
        </aside>

        <main className={styles.results}>
          <div className={styles.resultsHeader}><div><h1>{title}</h1><p>Find the latest products with top features and best prices.</p></div><div><span>Showing 1–24 of 324 products</span><label>Sort by: <select aria-label="Sort products"><option>Popularity</option><option>Price: Low to High</option><option>Price: High to Low</option><option>Newest</option></select></label></div></div>
          <details className={styles.mobileFilters}><summary><ListFilter /> Filters & Categories</summary><Filters /></details>
          <div className={styles.chips}>{["All", "5G Phones", "Android Phones", "iOS Phones", "Gaming Phones", "Budget Phones", "Flagship Phones"].map((chip, index) => <button className={index === 0 ? styles.activeChip : ""} key={chip}>{chip}</button>)}</div>
          <section className={styles.productGrid} aria-label={`${title} products`}>
            {products.map(([name, price, oldPrice, rating, reviews, item], index) => <article className={styles.productCard} key={`${name}-${index}`}>
              <div className={styles.productImage}><span style={{ "--item": item } as React.CSSProperties} /><button aria-label={`Save ${name}`}><Heart /></button></div>
              <div className={styles.productBody}><h2><Link href={`/categories/${categorySlug}/${name.toLowerCase().replaceAll(" ", "-").replaceAll("(", "").replaceAll(")", "")}`}>{name}</Link></h2><p className={styles.rating}><strong>{rating}</strong> <span>★★★★★</span> <small>({reviews})</small></p><p className={styles.price}><strong>{price}</strong><del>{oldPrice}</del><em>{11 + index}% OFF</em></p><button className={styles.addButton}><ShoppingCart /> Add to Cart</button></div>
            </article>)}
          </section>
          <nav className={styles.pagination} aria-label="Pagination">{["1", "2", "3", "4", "…", "14"].map((page, index) => <Link className={index === 0 ? styles.currentPage : ""} href="#" key={page}>{page}</Link>)}<Link href="#" aria-label="Next page"><ChevronRight /></Link></nav>
        </main>
      </div>
    </div>
  </CustomerStoreLayout>;
}
