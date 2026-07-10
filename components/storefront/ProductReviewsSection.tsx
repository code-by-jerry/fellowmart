"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Star, ThumbsUp } from "lucide-react";
import type { ProductReview, ProductReviewSummary } from "@/lib/storefront/product-reviews";
import styles from "@/app/categories/[category]/[product]/product.module.css";

type SortKey = "recent" | "helpful" | "rating";

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className={styles.reviewStarRow} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          width={size}
          height={size}
          className={index < rating ? styles.reviewStarFilled : styles.reviewStarEmpty}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function ProductReviewsSection({
  productName,
  summary,
  reviews,
}: {
  productName: string;
  summary: ProductReviewSummary;
  reviews: ProductReview[];
}) {
  const [sort, setSort] = useState<SortKey>("recent");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const sorted = useMemo(() => {
    let list = [...reviews];
    if (filterRating) {
      list = list.filter((review) => review.rating === filterRating);
    }
    if (sort === "helpful") {
      list.sort((a, b) => b.helpful - a.helpful);
    } else if (sort === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [reviews, sort, filterRating]);

  const recommendPercent = Math.round(
    ((summary.distribution[5] + summary.distribution[4]) / summary.total) * 100,
  );

  return (
    <div className={styles.reviewsPanel} id="product-reviews">
      <div className={styles.reviewsSummary}>
        <div className={styles.reviewsScore}>
          <strong>{summary.average.toFixed(1)}</strong>
          <Stars rating={Math.round(summary.average)} size={16} />
          <span>{summary.total} reviews</span>
          <small>{recommendPercent}% recommend this product</small>
        </div>

        <div className={styles.reviewsBars}>
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = summary.distribution[star];
            const width = summary.total ? (count / summary.total) * 100 : 0;
            return (
              <button
                key={star}
                type="button"
                className={styles.reviewsBarRow}
                onClick={() =>
                  setFilterRating((current) => (current === star ? null : star))
                }
                aria-pressed={filterRating === star}
              >
                <span>{star}★</span>
                <i>
                  <span style={{ width: `${width}%` }} />
                </i>
                <em>{count}</em>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.reviewsToolbar}>
        <p>
          Customer reviews for <strong>{productName}</strong>
        </p>
        <label className={styles.reviewsSort}>
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
          >
            <option value="recent">Most recent</option>
            <option value="helpful">Most helpful</option>
            <option value="rating">Highest rated</option>
          </select>
        </label>
      </div>

      <div className={styles.reviewsList}>
        {sorted.length === 0 ? (
          <p className={styles.reviewsEmpty}>
            No reviews match this filter yet.
          </p>
        ) : (
          sorted.map((review) => (
            <article key={review.id} className={styles.reviewItem}>
              <header className={styles.reviewItemHeader}>
                <div
                  className={styles.reviewAvatar}
                  style={{ background: `hsl(${review.avatarHue} 42% 42%)` }}
                >
                  {review.initials}
                </div>
                <div className={styles.reviewItemMeta}>
                  <div className={styles.reviewItemTop}>
                    <strong>{review.author}</strong>
                    {review.verified ? (
                      <span className={styles.reviewVerified}>
                        <BadgeCheck aria-hidden="true" />
                        Verified purchase
                      </span>
                    ) : null}
                  </div>
                  <div className={styles.reviewItemSub}>
                    <Stars rating={review.rating} />
                    <span>{review.relativeDate}</span>
                  </div>
                </div>
              </header>

              <h3 className={styles.reviewTitle}>{review.title}</h3>
              <p className={styles.reviewBody}>{review.body}</p>

              {review.images.length > 0 ? (
                <div className={styles.reviewPhotos}>
                  {review.images.map((src) => (
                    <button
                      key={src}
                      type="button"
                      className={styles.reviewPhotoBtn}
                      onClick={() => setExpandedImage(src)}
                      aria-label="View customer photo"
                    >
                      <Image
                        src={src}
                        alt={`Photo from ${review.author}`}
                        fill
                        sizes="88px"
                        className={styles.reviewPhotoImg}
                      />
                    </button>
                  ))}
                </div>
              ) : null}

              <footer className={styles.reviewFooter}>
                <button type="button" className={styles.reviewHelpful}>
                  <ThumbsUp aria-hidden="true" />
                  Helpful ({review.helpful})
                </button>
              </footer>
            </article>
          ))
        )}
      </div>

      {expandedImage ? (
        <button
          type="button"
          className={styles.reviewLightbox}
          onClick={() => setExpandedImage(null)}
          aria-label="Close image preview"
        >
          <span className={styles.reviewLightboxInner}>
            <Image
              src={expandedImage}
              alt="Customer review photo"
              fill
              sizes="90vw"
              className={styles.reviewLightboxImg}
            />
          </span>
        </button>
      ) : null}
    </div>
  );
}

export function ProductRatingBadge({
  average,
  total,
}: {
  average: number;
  total: number;
}) {
  return (
    <a href="#product-reviews" className={styles.ratingBadge}>
      <Stars rating={Math.round(average)} size={13} />
      <span>
        {average.toFixed(1)} · {total} reviews
      </span>
    </a>
  );
}
