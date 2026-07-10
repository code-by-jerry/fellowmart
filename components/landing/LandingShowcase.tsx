"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingScrollReveal } from "./LandingScrollReveal";
import styles from "./landing.module.css";

const showcaseItems = [
  {
    title: "Home & Living",
    image: "/images/showcase/home-living.jpg",
    alt: "Modern armchair in a bright living room",
  },
  {
    title: "Watches & Accessories",
    image: "/images/showcase/watches.jpg",
    alt: "Minimalist wristwatch product photo",
  },
  {
    title: "Beauty & Fragrance",
    image: "/images/showcase/beauty.jpg",
    alt: "Perfume bottle on a clean studio backdrop",
  },
  {
    title: "Footwear",
    image: "/images/showcase/footwear.jpg",
    alt: "Sneakers on a neutral background",
  },
  {
    title: "Electronics",
    image: "/images/showcase/electronics.jpg",
    alt: "Wireless headphones product shot",
  },
  {
    title: "Kitchen & Dining",
    image: "/images/showcase/kitchen.jpg",
    alt: "Kitchen cookware and utensils",
  },
];

export function LandingShowcase({ demoStoreHref }: { demoStoreHref: string }) {
  return (
    <section className={`${styles.sectionBand} ${styles.sectionWhite}`}>
      <div className={styles.sectionInner}>
        <LandingScrollReveal>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>Storefront preview</p>
            <h2>Beautiful storefronts that convert</h2>
            <p>
              Launch a polished shop across categories — from fashion to electronics —
              with layouts built to drive sales.
            </p>
          </div>
        </LandingScrollReveal>

        <div className={styles.showcaseGrid}>
          {showcaseItems.map((item, index) => (
            <LandingScrollReveal key={item.title} delay={index * 80} fill>
              <article className={styles.showcaseCard}>
                <div className={styles.showcaseImage}>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className={styles.showcaseImageImg}
                  />
                </div>
                <div className={styles.showcaseCardBody}>
                  <h3>{item.title}</h3>
                  <Link href={demoStoreHref} className={styles.showcaseLink}>
                    Explore demo <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            </LandingScrollReveal>
        ))}
      </div>

        <LandingScrollReveal delay={120}>
          <div className={styles.showcaseBanner}>
            <div className={styles.showcaseBannerImage}>
              <Image
                src="/images/fellowmate-hero.png"
                alt="Premium product lifestyle showcase"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.showcaseBannerImg}
              />
            </div>
            <div className={styles.showcaseBannerCopy}>
              <p className={styles.eyebrow}>Ready to grow?</p>
              <h3>Turn your catalog into a revenue engine</h3>
              <p>
                Manage inventory, accept payments, and track orders — all from one
                dashboard designed for modern sellers.
              </p>
              <Link href="/apply" className={styles.primaryBtn}>
                Start selling today <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </LandingScrollReveal>
      </div>
    </section>
  );
}
