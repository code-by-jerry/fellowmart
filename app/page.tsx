import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Heart,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { CustomerStoreLayout } from "@/components/storefront/CustomerStoreLayout";
import { getSiteSettings } from "@/lib/site-config-server";
import styles from "./home.module.css";

const benefits = [
  { icon: Truck, title: "Free Delivery", text: "On orders above $49" },
  { icon: ShieldCheck, title: "Secure Payment", text: "100% secure payment" },
  { icon: RotateCcw, title: "Easy Returns", text: "30 days return policy" },
  { icon: Headphones, title: "24/7 Support", text: "Dedicated support" },
];

const collections = [
  ["Home & Living", "120+ Items"], ["Accessories", "90+ Items"], ["Beauty & Care", "150+ Items"],
  ["Footwear", "200+ Items"], ["Electronics", "300+ Items"], ["Kitchen", "180+ Items"],
];
const featuredProducts = [
  ["Urban Voyager Backpack", "$49.99", "120"], ["Classic Leather Watch", "$149.00", "86"],
  ["Daily Hydrating Cleanser", "$19.99", "57"], ["Minimal White Sneakers", "$69.00", "210"],
  ["Premium Wireless Headphones", "$89.00", "98"], ["Minimal Ceramic Vase", "$24.99", "43"],
];
const flashDeals = [
  ["Wireless Earbuds", "$34.99", "$49.99", "-30%"], ["Luxury Perfume", "$59.99", "$79.99", "-25%"],
  ["Cotton Basic T-Shirt", "$15.99", "$19.99", "-20%"], ["Non-stick Casserole", "$32.49", "$49.99", "-35%"],
  ["LED Desk Lamp", "$29.99", "$39.99", "-25%"], ["Travel Duffle Bag", "$41.99", "$59.99", "-30%"],
];

const brandNames = ["APPLE", "SAMSUNG", "NIKE", "adidas", "SONY", "boAt", "PHILIPS", "dyson"];

const reviews = [
  { initials: "SJ", name: "Sarah Johnson", text: "Amazing quality and fast delivery! FellowMate has become my go-to store for everything." },
  { initials: "MB", name: "Michael Brown", text: "Great products at affordable prices. Highly recommended!" },
  { initials: "ED", name: "Emily Davis", text: "Excellent customer service and a smooth shopping experience." },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const settings = await getSiteSettings();
  const userName = user?.email?.split("@")[0] ?? null;

  return (
    <CustomerStoreLayout userName={userName} showCategoryNav>
        <section className={styles.hero} aria-labelledby="hero-title">
          <Image
            src="/images/fellowmate-hero.png"
            alt="Black backpack, sneaker, bottle and watch arranged in a minimal studio"
            fill
            preload
            sizes="(max-width: 760px) 160vw, 100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{settings.home_hero_eyebrow} <span /></p>
            <h1 id="hero-title">{settings.home_hero_title}</h1>
            <p className={styles.description}>{settings.home_hero_description}</p>
            <Link href="#" className={styles.cta}>Shop Now <ArrowRight aria-hidden="true" /></Link>
          </div>
          <button className={`${styles.sliderArrow} ${styles.previous}`} aria-label="Previous slide"><ChevronLeft /></button>
          <button className={`${styles.sliderArrow} ${styles.next}`} aria-label="Next slide"><ChevronRight /></button>
          <div className={styles.dots} aria-label="Slide 1 of 5">
            <span className={styles.currentDot} /><span /><span /><span /><span />
          </div>
        </section>

        <div className={styles.finalContent}>
          <section className={styles.benefits} aria-label="Shopping benefits">
            {benefits.map(({ icon: Icon, title, text }) => <div className={styles.benefit} key={title}><Icon /><p><strong>{title}</strong><span>{text}</span></p></div>)}
          </section>
          <section className={styles.marketSection}>
            <div className={styles.sectionHeading}><h2>Shop by Collection</h2><Link href="/categories">View all collections <ArrowRight /></Link></div>
            <div className={styles.collectionGrid}>{collections.map(([name, count], index) => <Link href="/categories" className={styles.collectionCard} key={name}><span className={styles.sprite} style={{ "--item": index } as React.CSSProperties} /><div><strong>{name}</strong><small>{count}</small></div></Link>)}</div>
          </section>
          <section className={styles.marketSection}>
            <div className={styles.sectionHeading}><h2>Featured Products</h2><Link href="/categories/best-sellers">View all products <ArrowRight /></Link></div>
            <div className={styles.productGrid}>{featuredProducts.map(([name, price, reviews], index) => <article className={styles.productCard} key={name}><div className={styles.productImage}><span className={styles.featuredSprite} style={{ "--item": index } as React.CSSProperties} /><button aria-label={`Save ${name}`}><Heart /></button></div><div className={styles.productInfo}><h3>{name}</h3><strong>{price}</strong><p><span>★★★★★</span> <small>({reviews})</small></p></div></article>)}</div>
          </section>
          <section className={styles.saleBanner}><div className={styles.saleIcon}><Zap /></div><div><strong>Weekend Mega Sale</strong><h2>UP TO 40% OFF</h2><p>Limited time offer on selected items</p></div><div className={styles.saleDecor}><span /><span /><span /></div><Link href="/categories/deals">Shop Now <ArrowRight /></Link></section>
          <section className={styles.marketSection}>
            <div className={`${styles.sectionHeading} ${styles.flashHeading}`}><div><Zap /><span><h2>Flash Sale</h2><small>Hurry up! Limited time deals</small></span></div><div className={styles.countdown}><small>Ends in</small><b>02<span>Hours</span></b><b>15<span>Mins</span></b><b>30<span>Secs</span></b></div><Link href="/categories/deals">View all deals <ArrowRight /></Link></div>
            <div className={styles.productGrid}>{flashDeals.map(([name, price, oldPrice, discount], index) => <article className={styles.productCard} key={name}><div className={styles.productImage}><span className={styles.dealSprite} style={{ "--item": index } as React.CSSProperties} /><b className={styles.discount}>{discount}</b></div><div className={styles.productInfo}><h3>{name}</h3><strong>{price}</strong> <del>{oldPrice}</del></div></article>)}</div>
          </section>

          <section className={styles.finalSection} id="brands">
            <div className={styles.sectionHeading}><h2>Popular Brands</h2><Link href="#">View all brands <ArrowRight /></Link></div>
            <div className={styles.finalBrands}>{brandNames.map((brand) => <Link href="#" key={brand}>{brand}</Link>)}</div>
          </section>

          <section className={styles.lifestyleBanner}>
            <div><h2>Make Your Space<br />More Beautiful</h2><p>Discover premium products for every<br />corner of your home.</p><Link href="#">Explore Collection <ArrowRight /></Link></div>
            <div className={styles.roomPlaceholder} aria-hidden="true"><span /><span /><span /><span /></div>
          </section>

          <section className={styles.finalSection}>
            <div className={styles.sectionHeading}><h2>What Our Customers Say</h2><Link href="#">View all reviews <ArrowRight /></Link></div>
            <div className={styles.finalReviews}>{reviews.map((review, index) => <article key={review.name}><div className={`${styles.avatar} ${styles[`avatar${index + 1}`]}`}>{review.initials}</div><div><p>★★★★★</p><blockquote>{review.text}</blockquote><strong>— {review.name}</strong></div></article>)}</div>
          </section>

          <section className={styles.instagramSection}>
            <div className={styles.sectionHeading}><h2>Follow Us on Instagram <small>@{settings.app_name.toLowerCase().replaceAll(" ", "")}.store</small></h2><Link href="#">View all posts <ArrowRight /></Link></div>
            <div className={styles.instagramGrid}>{[0,4,2,3,5,1,0,3].map((item, index) => <Link href="#" key={index} aria-label={`Instagram post ${index + 1}`}><span className={index % 2 ? styles.featuredSprite : styles.sprite} style={{ "--item": item } as React.CSSProperties} /></Link>)}</div>
          </section>

          <section className={styles.newsletter}>
            <div><span><Mail /></span><p><strong>Stay Updated!</strong><small>Subscribe to our newsletter and get 10% off your first order.</small></p></div>
            <form><input type="email" aria-label="Email address" placeholder="Enter your email address" /><button>Subscribe</button></form>
          </section>
        </div>
    </CustomerStoreLayout>
  );
}
