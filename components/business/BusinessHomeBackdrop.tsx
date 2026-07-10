"use client";

import { useEffect, useRef } from "react";
import styles from "./BusinessHomeBackdrop.module.css";

export function BusinessHomeBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    let frame = 0;

    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;
        root.style.setProperty("--mx", x.toFixed(3));
        root.style.setProperty("--my", y.toFixed(3));
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden>
      <div className={styles.wash} />
      <div className={styles.grid} />
      <div className={styles.orbA} />
      <div className={styles.orbB} />
      <div className={styles.orbC} />
      <div className={styles.glow} />
      <svg className={styles.network} viewBox="0 0 1200 800" fill="none">
        <g stroke="currentColor" strokeWidth="1">
          <path d="M120 160 L320 220 L480 140 L700 210 L920 150 L1080 240" />
          <path d="M180 420 L360 360 L540 430 L760 350 L980 420 L1120 360" />
          <path d="M140 640 L340 580 L560 650 L780 570 L1000 640" />
          <path d="M320 220 L360 360 L340 580" />
          <path d="M480 140 L540 430 L560 650" />
          <path d="M700 210 L760 350 L780 570" />
          <path d="M920 150 L980 420 L1000 640" />
        </g>
        <g fill="currentColor">
          <circle cx="120" cy="160" r="3.5" />
          <circle cx="320" cy="220" r="4.5" />
          <circle cx="480" cy="140" r="3" />
          <circle cx="700" cy="210" r="5" />
          <circle cx="920" cy="150" r="3.5" />
          <circle cx="1080" cy="240" r="4" />
          <circle cx="180" cy="420" r="3" />
          <circle cx="360" cy="360" r="4" />
          <circle cx="540" cy="430" r="5" />
          <circle cx="760" cy="350" r="3.5" />
          <circle cx="980" cy="420" r="4" />
          <circle cx="1120" cy="360" r="3" />
          <circle cx="140" cy="640" r="3.5" />
          <circle cx="340" cy="580" r="4" />
          <circle cx="560" cy="650" r="3" />
          <circle cx="780" cy="570" r="4.5" />
          <circle cx="1000" cy="640" r="3.5" />
        </g>
      </svg>
    </div>
  );
}
