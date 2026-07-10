import type { LucideIcon } from "lucide-react";
import type { Category } from "@/lib/types/ecommerce";
import {
  Armchair,
  Baby,
  Bath,
  Bike,
  BookOpen,
  Briefcase,
  Camera,
  Car,
  Cat,
  CookingPot,
  Cpu,
  Dog,
  Dumbbell,
  Flower2,
  Footprints,
  Gamepad2,
  Gift,
  Glasses,
  Guitar,
  Hammer,
  Handbag,
  Headphones,
  HeartPulse,
  Home,
  Lamp,
  Laptop,
  LayoutGrid,
  Leaf,
  Monitor,
  Music,
  Package,
  Palette,
  PawPrint,
  PenTool,
  Pill,
  Plane,
  Plug,
  Printer,
  Refrigerator,
  Scissors,
  Shirt,
  ShoppingBag,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  SprayCan,
  Store,
  Sun,
  Tablet,
  Tent,
  ToyBrick,
  TreePine,
  Tv,
  Utensils,
  Watch,
  Wrench,
  Zap,
} from "lucide-react";

export type CategoryIconOption = {
  name: string;
  label: string;
  keywords: string;
  Icon: LucideIcon;
};

/** Curated Lucide icons for storefront category nav */
export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { name: "LayoutGrid", label: "Grid", keywords: "all general default", Icon: LayoutGrid },
  { name: "Smartphone", label: "Phone", keywords: "electronics mobile phone", Icon: Smartphone },
  { name: "Laptop", label: "Laptop", keywords: "electronics computer", Icon: Laptop },
  { name: "Tablet", label: "Tablet", keywords: "electronics ipad", Icon: Tablet },
  { name: "Monitor", label: "Monitor", keywords: "electronics display screen", Icon: Monitor },
  { name: "Tv", label: "TV", keywords: "electronics television", Icon: Tv },
  { name: "Headphones", label: "Headphones", keywords: "audio music electronics", Icon: Headphones },
  { name: "Camera", label: "Camera", keywords: "photo electronics", Icon: Camera },
  { name: "Watch", label: "Watch", keywords: "wearable accessories", Icon: Watch },
  { name: "Cpu", label: "Chip", keywords: "tech computer electronics", Icon: Cpu },
  { name: "Plug", label: "Plug", keywords: "power electronics accessories", Icon: Plug },
  { name: "Printer", label: "Printer", keywords: "office electronics", Icon: Printer },
  { name: "Gamepad2", label: "Gaming", keywords: "games console electronics", Icon: Gamepad2 },
  { name: "Shirt", label: "Fashion", keywords: "clothing apparel fashion", Icon: Shirt },
  { name: "Glasses", label: "Glasses", keywords: "eyewear fashion accessories", Icon: Glasses },
  { name: "Footprints", label: "Footwear", keywords: "shoes sneakers fashion", Icon: Footprints },
  { name: "Handbag", label: "Handbag", keywords: "bag fashion accessories", Icon: Handbag },
  { name: "ShoppingBag", label: "Shopping bag", keywords: "fashion retail", Icon: ShoppingBag },
  { name: "Armchair", label: "Furniture", keywords: "home living chair", Icon: Armchair },
  { name: "Sofa", label: "Sofa", keywords: "home living furniture", Icon: Sofa },
  { name: "Home", label: "Home", keywords: "house living", Icon: Home },
  { name: "Lamp", label: "Lamp", keywords: "lighting home decor", Icon: Lamp },
  { name: "Bath", label: "Bath", keywords: "bathroom home", Icon: Bath },
  { name: "SprayCan", label: "Beauty", keywords: "beauty care cosmetics", Icon: SprayCan },
  { name: "Sparkles", label: "Sparkles", keywords: "beauty care premium", Icon: Sparkles },
  { name: "Scissors", label: "Salon", keywords: "beauty hair care", Icon: Scissors },
  { name: "HeartPulse", label: "Health", keywords: "wellness medical care", Icon: HeartPulse },
  { name: "Pill", label: "Pharmacy", keywords: "medicine health", Icon: Pill },
  { name: "CookingPot", label: "Kitchen", keywords: "cookware cooking", Icon: CookingPot },
  { name: "Utensils", label: "Utensils", keywords: "kitchen dining", Icon: Utensils },
  { name: "Refrigerator", label: "Appliance", keywords: "kitchen fridge home", Icon: Refrigerator },
  { name: "ShoppingBasket", label: "Grocery", keywords: "food market basket", Icon: ShoppingBasket },
  { name: "Leaf", label: "Organic", keywords: "grocery natural green", Icon: Leaf },
  { name: "Dumbbell", label: "Sports", keywords: "fitness gym outdoor", Icon: Dumbbell },
  { name: "Bike", label: "Bike", keywords: "sports outdoor cycling", Icon: Bike },
  { name: "Tent", label: "Camping", keywords: "outdoor adventure", Icon: Tent },
  { name: "TreePine", label: "Outdoor", keywords: "nature sports", Icon: TreePine },
  { name: "Baby", label: "Baby", keywords: "kids infant children", Icon: Baby },
  { name: "ToyBrick", label: "Toys", keywords: "kids children play", Icon: ToyBrick },
  { name: "BookOpen", label: "Books", keywords: "stationery reading", Icon: BookOpen },
  { name: "PenTool", label: "Stationery", keywords: "office pen writing", Icon: PenTool },
  { name: "Palette", label: "Art", keywords: "craft creative stationery", Icon: Palette },
  { name: "Car", label: "Auto", keywords: "automotive vehicle", Icon: Car },
  { name: "Wrench", label: "Tools", keywords: "auto repair hardware", Icon: Wrench },
  { name: "Hammer", label: "Hardware", keywords: "tools diy", Icon: Hammer },
  { name: "Music", label: "Music", keywords: "audio entertainment", Icon: Music },
  { name: "Guitar", label: "Guitar", keywords: "music instruments", Icon: Guitar },
  { name: "Gift", label: "Gifts", keywords: "presents special", Icon: Gift },
  { name: "Flower2", label: "Flowers", keywords: "garden plants", Icon: Flower2 },
  { name: "Sun", label: "Garden", keywords: "outdoor plants", Icon: Sun },
  { name: "PawPrint", label: "Pets", keywords: "animals pet", Icon: PawPrint },
  { name: "Dog", label: "Dog", keywords: "pets animals", Icon: Dog },
  { name: "Cat", label: "Cat", keywords: "pets animals", Icon: Cat },
  { name: "Plane", label: "Travel", keywords: "trip luggage", Icon: Plane },
  { name: "Briefcase", label: "Office", keywords: "work business", Icon: Briefcase },
  { name: "Package", label: "Package", keywords: "shipping box general", Icon: Package },
  { name: "Store", label: "Store", keywords: "shop retail", Icon: Store },
  { name: "Zap", label: "Deals", keywords: "flash sale energy", Icon: Zap },
];

export const categoryIconMap: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICON_OPTIONS.map((option) => [option.name, option.Icon]),
);

export const CATEGORY_ICON_NAMES = CATEGORY_ICON_OPTIONS.map((o) => o.name);

export function getCategoryIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return LayoutGrid;
  return categoryIconMap[iconName] ?? LayoutGrid;
}

export function getCategoryIconOption(iconName?: string | null) {
  return (
    CATEGORY_ICON_OPTIONS.find((o) => o.name === iconName) ??
    CATEGORY_ICON_OPTIONS[0]
  );
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
