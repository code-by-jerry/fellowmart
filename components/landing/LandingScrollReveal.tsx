"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./landing.module.css";

type LandingScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  fill?: boolean;
};

export function LandingScrollReveal({
  children,
  className = "",
  delay = 0,
  fill = false,
}: LandingScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.style.setProperty("--reveal-delay", `${delay}ms`);
          node.classList.add(styles.revealed);
          observer.unobserve(node);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${fill ? styles.revealFill : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
