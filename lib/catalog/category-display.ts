import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  Baby,
  BookOpen,
  Car,
  CookingPot,
  Dumbbell,
  LayoutGrid,
  Shirt,
  ShoppingBasket,
  Smartphone,
  SprayCan,
} from "lucide-react";
import type { Category } from "@/lib/types/ecommerce";

export const categoryIconMap: Record<string, LucideIcon> = {
  Smartphone,
  Shirt,
  Armchair,
  SprayCan,
  CookingPot,
  ShoppingBasket,
  Dumbbell,
  Baby,
  BookOpen,
  Car,
  LayoutGrid,
};

export function getCategoryIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return LayoutGrid;
  return categoryIconMap[iconName] ?? LayoutGrid;
}

/** Sprite index used by collection-sprite.png on category cards */
export const categorySpriteIndex: Record<string, number> = {
  electronics: 4,
  fashion: 3,
  "home-living": 0,
  "beauty-care": 2,
  kitchen: 5,
  grocery: 0,
  "sports-outdoors": 4,
  "baby-kids": 1,
  "books-stationery": 3,
  automotive: 5,
};

export function getCategorySpriteIndex(slug: string, fallback = 0): number {
  return categorySpriteIndex[slug] ?? fallback;
}

export type StorefrontCategory = Category & {
  icon_name?: string | null;
  product_count_text?: string | null;
};
