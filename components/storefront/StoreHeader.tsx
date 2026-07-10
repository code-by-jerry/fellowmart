"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, UserRound } from "lucide-react";
import styles from "@/app/home.module.css";
import { CartDrawer } from "./CartDrawer";
import { WishlistDrawer } from "./WishlistDrawer";
import type { SiteSettings } from "@/lib/site-config";
import { cn } from "@/lib/utils";

function Brand({
  settings,
  homeHref,
}: {
  settings: SiteSettings;
  homeHref: string;
}) {
  return (
    <Link href={homeHref} className={styles.brand} aria-label={`${settings.app_name} home`}>
      {settings.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={settings.logo_url} alt={settings.logo_alt} className={styles.siteLogo} />
      ) : (
        <span className={styles.mark}>FM</span>
      )}
    </Link>
  );
}

export function StoreHeader({
  userName,
  settings,
  homeHref,
  searchHref,
  profileHref = "/profile",
  loginHref = "/login",
}: {
  userName?: string | null;
  settings: SiteSettings;
  homeHref: string;
  searchHref: string;
  profileHref?: string;
  loginHref?: string;
}) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`${searchHref}?q=${encodeURIComponent(q)}`);
  };

  return (
    <header
      className={cn(styles.header, scrolled && styles.headerSticky)}
      data-scrolled={scrolled ? "true" : "false"}
    >
      <div className={styles.headerInner}>
        <Brand settings={settings} homeHref={homeHref} />

        <form className={styles.search} role="search" onSubmit={submitSearch}>
          <label className={styles.searchInput}>
            <span className="sr-only">Search products</span>
            <Search className={styles.searchLeadingIcon} aria-hidden="true" />
            <input
              placeholder="Search products, brands and more..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button type="submit" className={styles.searchButton} aria-label="Search">
            <Search aria-hidden="true" />
          </button>
        </form>

        <div className={styles.accountActions}>
          <Link
            href={userName ? profileHref : loginHref}
            className={styles.account}
            aria-label={userName ? "Account" : "Sign in"}
          >
            {userName ? (
              <div className={styles.userAvatar}>{userName.charAt(0).toUpperCase()}</div>
            ) : (
              <UserRound aria-hidden="true" />
            )}
          </Link>
          <WishlistDrawer />
          <CartDrawer />
        </div>
      </div>

      <form className={styles.mobileSearch} role="search" onSubmit={submitSearch}>
        <Search aria-hidden="true" />
        <input
          placeholder="Search products, brands and more..."
          aria-label="Search products"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </form>
    </header>
  );
}
