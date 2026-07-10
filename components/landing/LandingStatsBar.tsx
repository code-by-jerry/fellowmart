"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./landing.module.css";

const stats = [
  { value: 500, suffix: "+", label: "Businesses onboarded" },
  { value: 50, suffix: "K+", label: "Orders processed" },
  { value: 99.9, suffix: "%", label: "Platform uptime" },
  { value: 24, suffix: "/7", label: "Support available" },
];

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, duration, target]);

  return value;
}

function StatItem({
  value,
  suffix,
  label,
  active,
}: {
  value: number;
  suffix: string;
  label: string;
  active: boolean;
}) {
  const count = useCountUp(value, active);
  const display =
    suffix === "%" ? count.toFixed(1) : Math.round(count).toLocaleString();

  return (
    <div className={styles.statItem}>
      <strong>
        {display}
        {suffix}
      </strong>
      <span>{label}</span>
    </div>
  );
}

export function LandingStatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={`${styles.sectionBand} ${styles.sectionPrimarySoft}`}>
      <div ref={ref} className={styles.statsBar}>
        {stats.map((stat) => (
          <StatItem key={stat.label} {...stat} active={active} />
        ))}
      </div>
    </section>
  );
}
