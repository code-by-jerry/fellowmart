"use client";

import { useEffect, useState, type ReactNode } from "react";
import styles from "@/app/categories/[category]/[product]/product.module.css";

type TabId = "description" | "specifications" | "reviews" | "shipping";

const TABS: { id: TabId; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "specifications", label: "Specifications" },
  { id: "reviews", label: "Reviews" },
  { id: "shipping", label: "Shipping & Returns" },
];

export function ProductDetailTabs({
  description,
  specifications,
  reviews,
  shipping,
  reviewCount,
}: {
  description: ReactNode;
  specifications: ReactNode;
  reviews: ReactNode;
  shipping: ReactNode;
  reviewCount: number;
}) {
  const [active, setActive] = useState<TabId>("description");

  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash === "#product-reviews") {
        setActive("reviews");
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const panels: Record<TabId, ReactNode> = {
    description,
    specifications,
    reviews,
    shipping,
  };

  return (
    <section className={styles.details}>
      <div className={styles.tabs} role="tablist" aria-label="Product information">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={active === tab.id ? styles.activeTab : undefined}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
            {tab.id === "reviews" && reviewCount > 0 ? (
              <span className={styles.tabCount}>{reviewCount}</span>
            ) : null}
          </button>
        ))}
      </div>
      <div className={styles.tabPanel} role="tabpanel">
        {panels[active]}
      </div>
    </section>
  );
}
