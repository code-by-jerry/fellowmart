"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import styles from "./landing.module.css";

type LandingHeaderProps = {
  brandName: string;
  logoUrl?: string | null;
  logoAlt: string;
};

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

const resourceLinks = [
  { href: "/apply", label: "Business application" },
  { href: "/store/fellowmart", label: "Demo storefront" },
  { href: "/business/login", label: "Business help" },
];

export function LandingHeader({ brandName, logoUrl, logoAlt }: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.brand}>
          {logoUrl ? (
            <img src={logoUrl} alt={logoAlt} className={styles.logo} />
          ) : (
            <>
              <span className={styles.mark}>FM</span>
              <span className={styles.brandText}>
                <strong>{brandName}</strong>
                <small>Smart Choices, Better Living</small>
              </span>
            </>
          )}
        </Link>

        <nav className={styles.navDesktop} aria-label="Main">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <details className={styles.resourcesMenu}>
            <summary>
              Resources <ChevronDown size={14} />
            </summary>
            <div className={styles.resourcesDropdown}>
              {resourceLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>
          </details>
        </nav>

        <div className={styles.headerActions}>
          <Link href="/login" className={styles.signInLink}>
            Sign in
          </Link>
          <Link href="/apply" className={styles.navCta}>
            Business sign up
          </Link>
          <button
            type="button"
            className={styles.menuToggle}
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className={styles.mobileNav}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <p className={styles.mobileNavLabel}>Resources</p>
          {resourceLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setMobileOpen(false)}>
            Sign in
          </Link>
        </div>
      ) : null}
    </header>
  );
}
