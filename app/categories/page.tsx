import Link from "next/link";
import {
  Armchair,
  ArrowRight,
  Baby,
  BookOpen,
  Car,
  CookingPot,
  Dumbbell,
  House,
  RotateCcw,
  ShieldCheck,
  Shirt,
  ShoppingBasket,
  Smartphone,
  SprayCan,
  Truck,
  Headphones,
} from "lucide-react";
import { CustomerStoreLayout } from "@/components/storefront/CustomerStoreLayout";
import { createClient } from "@/utils/supabase/server";
import styles from "./categories.module.css";

const categoryCards = [
  { name: "Electronics", count: "1200+ Products", icon: Smartphone, item: 4 },
  { name: "Fashion", count: "2500+ Products", icon: Shirt, item: 3 },
  { name: "Home & Living", count: "1800+ Products", icon: Armchair, item: 0 },
  { name: "Beauty & Care", count: "950+ Products", icon: SprayCan, item: 2 },
  { name: "Kitchen", count: "1100+ Products", icon: CookingPot, item: 5 },
  { name: "Grocery", count: "3000+ Products", icon: ShoppingBasket, item: 0 },
  { name: "Sports & Outdoors", count: "700+ Products", icon: Dumbbell, item: 4 },
  { name: "Baby & Kids", count: "850+ Products", icon: Baby, item: 1 },
  { name: "Books & Stationery", count: "650+ Products", icon: BookOpen, item: 3 },
  { name: "Automotive", count: "500+ Products", icon: Car, item: 5 },
];

const benefits = [
  { title: "Free Delivery", text: "On orders above $49", icon: Truck },
  { title: "Easy Returns", text: "30 days return policy", icon: RotateCcw },
  { title: "Secure Payment", text: "100% secure payment", icon: ShieldCheck },
  { title: "24/7 Support", text: "We’re here to help", icon: Headphones },
];

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.email?.split("@")[0] ?? null;

  return (
    <CustomerStoreLayout userName={userName} showCategoryNav={false}>
      <div className={styles.page}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/"><House /> Home</Link><span>/</span><span>Shop by Category</span>
        </nav>

        <div className={styles.headingRow}>
          <div><h1>Shop by Category</h1><p>Explore top categories and find exactly what you need.</p></div>
          <div className={styles.topBenefits}>
            {benefits.slice(0, 3).map(({ title, text, icon: Icon }) => <div key={title}><Icon /><p><strong>{title}</strong><span>{text}</span></p></div>)}
          </div>
        </div>

        <section className={styles.grid} aria-label="All product categories">
          {categoryCards.map(({ name, count, icon: Icon, item }, index) => (
            <article className={styles.card} key={name}>
              <div className={`${styles.image} ${index > 4 ? styles.alternateImage : ""}`}><span style={{ "--item": item } as React.CSSProperties} /></div>
              <div className={styles.icon}><Icon aria-hidden="true" /></div>
              <div className={styles.cardBody}><h2>{name}</h2><p>{count}</p><Link href={`/categories/${name.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-")}`}>Explore <ArrowRight /></Link></div>
            </article>
          ))}
        </section>
      </div>

      <section className={styles.bottomBenefits} aria-label="Shopping benefits">
        <div>{benefits.map(({ title, text, icon: Icon }) => <div key={title}><Icon /><p><strong>{title}</strong><span>{text}</span></p></div>)}</div>
      </section>
    </CustomerStoreLayout>
  );
}
