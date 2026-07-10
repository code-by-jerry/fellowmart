import type { CSSProperties } from "react";

/** Convert a hex color to relative luminance (0–1) for contrast calculation */
export function hexLuminance(hex: string): number {
  const normalized = hex.startsWith("#") ? hex : `#${hex}`;
  if (!/^#[0-9a-fA-F]{6}$/.test(normalized)) return 0;
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastForeground(hex: string): string {
  return hexLuminance(hex) > 0.35 ? "#000000" : "#ffffff";
}

/**
 * Storefront theme: solid primary only.
 * Surfaces stay gray/white — primary is for CTAs, active states, and badges.
 * Sets both shadcn tokens (--primary) and Tailwind v4 color tokens (--color-*).
 */
export function themeCssVars(themeColor: string): CSSProperties {
  const fg = contrastForeground(themeColor);
  const primary = themeColor.trim() || "#000000";

  return {
    // shadcn / CSS modules
    "--primary": primary,
    "--primary-foreground": fg,
    "--ring": primary,
    // Tailwind v4 @theme color utilities (bg-primary, text-primary, …)
    "--color-primary": primary,
    "--color-primary-foreground": fg,
    "--color-ring": primary,
  } as CSSProperties;
}
