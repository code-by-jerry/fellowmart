"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { StorefrontHeroBanner } from "@/lib/catalog/hero-banner-service";
import styles from "@/app/home.module.css";

type HeroSliderProps = {
  banners: StorefrontHeroBanner[];
  fallback: {
    eyebrow: string;
    title: string;
    description: string;
    href: string;
    imageSrc: string;
  };
};

export function HeroSlider({ banners, fallback }: HeroSliderProps) {
  const slides =
    banners.length > 0
      ? banners
      : [
          {
            id: "fallback",
            title: fallback.title,
            eyebrow: fallback.eyebrow,
            description: fallback.description,
            cta_label: "Shop Now",
            desktop_image_url: fallback.imageSrc,
            mobile_image_url: null,
            href: fallback.href,
            product_name: null,
          } satisfies StorefrontHeroBanner,
        ];

  const [index, setIndex] = useState(0);
  const count = slides.length;
  const slide = slides[index] ?? slides[0];

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((current) => (current + dir + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const timer = window.setInterval(() => go(1), 6500);
    return () => window.clearInterval(timer);
  }, [count, go, index]);

  useEffect(() => {
    setIndex(0);
  }, [banners.length]);

  const desktopSrc = slide.desktop_image_url;
  const mobileSrc = slide.mobile_image_url || slide.desktop_image_url;

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Link
        href={slide.href}
        className={styles.heroHitArea}
        aria-label={`${slide.cta_label || "Shop"}: ${slide.title}`}
      >
        <div className={styles.heroMedia} key={slide.id}>
          <Image
            src={desktopSrc}
            alt={slide.product_name ?? slide.title}
            fill
            preload={index === 0}
            sizes="(max-width: 760px) 100vw, 1378px"
            className={`${styles.heroImage} ${styles.heroImageDesktop}`}
          />
          <Image
            src={mobileSrc}
            alt={slide.product_name ?? slide.title}
            fill
            preload={index === 0}
            sizes="100vw"
            className={`${styles.heroImage} ${styles.heroImageMobile}`}
          />
        </div>
        <div className={styles.heroScrim} aria-hidden="true" />
        <div className={styles.heroCopy} key={`copy-${slide.id}`}>
          {slide.eyebrow ? (
            <p
              className={`${styles.eyebrow} ${styles.heroReveal} ${styles.heroReveal1}`}
            >
              {slide.eyebrow} <span />
            </p>
          ) : null}
          <h1
            id="hero-title"
            className={`${styles.heroReveal} ${styles.heroReveal2}`}
          >
            {slide.title}
          </h1>
          {slide.description ? (
            <p
              className={`${styles.description} ${styles.heroReveal} ${styles.heroReveal3}`}
            >
              {slide.description}
            </p>
          ) : null}
          <span
            className={`${styles.cta} ${styles.heroReveal} ${styles.heroReveal4}`}
          >
            {slide.cta_label || "Shop Now"} <ArrowRight aria-hidden="true" />
          </span>
        </div>
      </Link>

      {count > 1 ? (
        <>
          <button
            type="button"
            className={`${styles.sliderArrow} ${styles.previous}`}
            aria-label="Previous slide"
            onClick={() => go(-1)}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className={`${styles.sliderArrow} ${styles.next}`}
            aria-label="Next slide"
            onClick={() => go(1)}
          >
            <ChevronRight />
          </button>
          <div
            className={styles.dots}
            role="tablist"
            aria-label={`Slide ${index + 1} of ${count}`}
          >
            {slides.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                className={i === index ? styles.currentDot : undefined}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
