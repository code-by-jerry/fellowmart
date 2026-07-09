"use client";

import Link from "next/link";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { cn } from "@/lib/utils";

type SiteBrandProps = {
  variant?: "login" | "sidebar";
  subtitle?: string;
  href?: string;
  className?: string;
};

export function SiteBrand({
  variant = "login",
  subtitle,
  href,
  className,
}: SiteBrandProps) {
  const settings = useSiteSettings();
  const isLogin = variant === "login";

  const brandContent = settings.logo_url ? (
    <img
      src={settings.logo_url}
      alt={settings.logo_alt || settings.app_name}
      className={cn(
        "w-auto object-contain",
        isLogin
          ? "mx-auto h-12 max-w-[220px]"
          : "h-8 max-w-[160px]",
      )}
    />
  ) : (
    <span
      className={cn(
        "font-bold text-primary tracking-tight",
        isLogin ? "text-3xl" : "text-xl",
      )}
    >
      {settings.app_name}
    </span>
  );

  const content = (
    <div
      className={cn(
        isLogin ? "text-center" : "text-left",
        className,
      )}
    >
      {brandContent}
      {subtitle ? (
        <p
          className={cn(
            isLogin
              ? "mt-1 text-sm font-medium uppercase tracking-widest text-primary"
              : "mt-0.5 block text-xs text-gray-400",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
