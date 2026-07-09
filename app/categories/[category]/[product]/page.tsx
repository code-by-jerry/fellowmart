import Link from "next/link";
import { Check, ChevronRight, Heart, House, Minus, Plus, RotateCcw, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { CustomerStoreLayout } from "@/components/storefront/CustomerStoreLayout";
import { createClient } from "@/utils/supabase/server";
import styles from "./product.module.css";

const related = [
  ["Samsung Galaxy S23", "$699.00", 1], ["OnePlus 11R 5G", "$499.00", 2],
  ["Google Pixel 7a", "$449.00", 4], ["Xiaomi 13 Pro 5G", "$649.00", 3],
];

function titleFromSlug(slug: string) {
  return slug.split("-").map((word) => word ? word.charAt(0).toUpperCase() + word.slice(1) : word).join(" ");
}

export default async function ProductDetailPage({ params }: { params: Promise<{ category: string; product: string }> }) {
  const { category, product } = await params;
  const categoryTitle = titleFromSlug(category);
  const productTitle = titleFromSlug(product);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.email?.split("@")[0] ?? null;

  return <CustomerStoreLayout userName={userName} showCategoryNav={false}>
    <div className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/"><House /> Home</Link><ChevronRight /><Link href="/categories">Electronics</Link><ChevronRight /><Link href={`/categories/${category}`}>{categoryTitle}</Link><ChevronRight /><span>{productTitle}</span></nav>

      <section className={styles.productHero}>
        <div className={styles.gallery}>
          <div className={styles.thumbnails}>{[0,1,2,3].map((item, index) => <button className={index === 0 ? styles.activeThumb : ""} aria-label={`View product image ${index + 1}`} key={item}><span style={{ "--item": index === 0 ? 0 : item } as React.CSSProperties} /></button>)}</div>
          <div className={styles.mainImage}><span /><button aria-label="Add product to wishlist"><Heart /></button><small>Hover to zoom</small></div>
        </div>

        <div className={styles.productInfo}>
          <p className={styles.brand}>FELLOWMATE SELECT</p>
          <h1>{productTitle || "Apple iPhone 15 (128GB)"}</h1>
          <div className={styles.rating}><strong>4.7</strong><span>★★★★★</span><Link href="#reviews">256 Reviews</Link><i>SKU: FM-MOB-015</i></div>
          <p className={styles.summary}>Premium performance, exceptional camera quality and all-day battery life in a refined, durable design.</p>
          <div className={styles.price}><strong>$799.00</strong><del>$899.00</del><em>11% OFF</em></div>
          <p className={styles.tax}>Inclusive of all taxes. Free delivery available.</p>

          <fieldset className={styles.option}><legend>Color: <strong>Midnight Black</strong></legend><div className={styles.colors}><button className={styles.selectedColor} aria-label="Midnight Black" /><button aria-label="Silver" /><button aria-label="Blue" /></div></fieldset>
          <fieldset className={styles.option}><legend>Storage</legend><div className={styles.storage}>{["128 GB", "256 GB", "512 GB"].map((size, index) => <button className={index === 0 ? styles.selectedOption : ""} key={size}>{size}</button>)}</div></fieldset>

          <div className={styles.purchaseRow}><div className={styles.quantity}><button aria-label="Decrease quantity"><Minus /></button><span>1</span><button aria-label="Increase quantity"><Plus /></button></div><button className={styles.cartButton}><ShoppingCart /> Add to Cart</button><button className={styles.buyButton}>Buy Now</button></div>
          <p className={styles.stock}><Check /> In stock — ready to ship</p>

          <div className={styles.assurances}>
            <div><Truck /><p><strong>Free Delivery</strong><span>On orders above $49</span></p></div>
            <div><RotateCcw /><p><strong>Easy Returns</strong><span>30-day return policy</span></p></div>
            <div><ShieldCheck /><p><strong>Secure Payment</strong><span>Protected checkout</span></p></div>
          </div>
        </div>
      </section>

      <section className={styles.details}>
        <div className={styles.tabs}><button className={styles.activeTab}>Description</button><button>Specifications</button><button id="reviews">Reviews (256)</button><button>Shipping & Returns</button></div>
        <div className={styles.description}><div><h2>Designed for everyday excellence</h2><p>Experience a smooth, responsive device built around a vivid display, powerful performance and reliable battery life. Its precision-crafted body feels comfortable in hand while the advanced camera system captures detail in every light.</p><ul><li><Check /> Bright, immersive edge-to-edge display</li><li><Check /> Advanced dual-camera system</li><li><Check /> All-day battery with fast charging</li><li><Check /> Durable, water-resistant construction</li></ul></div><dl><div><dt>Display</dt><dd>6.1-inch OLED</dd></div><div><dt>Processor</dt><dd>Next-generation mobile chip</dd></div><div><dt>Camera</dt><dd>48MP main camera</dd></div><div><dt>Warranty</dt><dd>1 year manufacturer warranty</dd></div></dl></div>
      </section>

      <section className={styles.relatedSection}>
        <div className={styles.sectionTitle}><h2>You May Also Like</h2><Link href={`/categories/${category}`}>View all <ChevronRight /></Link></div>
        <div className={styles.relatedGrid}>{related.map(([name, price, item]) => <article key={name}><div className={styles.relatedImage}><span style={{ "--item": item } as React.CSSProperties} /><button aria-label={`Save ${name}`}><Heart /></button></div><h3>{name}</h3><p>★★★★★ <small>(84)</small></p><strong>{price}</strong></article>)}</div>
      </section>
    </div>
  </CustomerStoreLayout>;
}
