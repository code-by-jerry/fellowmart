/**
 * Fresh FellowMart demo store catalog (categories, collections, products, variants).
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Usage: npm run seed:fellowmart
 */
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
}

const db = createClient(URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TENANT_SLUG = "fellowmart";

async function getTenant() {
  const { data, error } = await db
    .from("tenants")
    .select("id")
    .eq("slug", TENANT_SLUG)
    .single();
  if (error || !data) {
    throw new Error(
      `Tenant "${TENANT_SLUG}" not found. Run supabase db push first.`,
    );
  }
  return data;
}

async function getCategoryMap(tenantId) {
  const { data } = await db
    .from("categories")
    .select("id, slug")
    .eq("tenant_id", tenantId);
  return Object.fromEntries((data ?? []).map((c) => [c.slug, c.id]));
}

async function getCollectionMap(tenantId) {
  const { data } = await db
    .from("collections")
    .select("id, slug")
    .eq("tenant_id", tenantId);
  return Object.fromEntries((data ?? []).map((c) => [c.slug, c.id]));
}

async function insertProduct(tenantId, categoryId, product) {
  const { data, error } = await db
    .from("products")
    .insert({
      tenant_id: tenantId,
      category_id: categoryId,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      brand: product.brand ?? null,
      subtitle: product.subtitle ?? null,
      description: product.description,
      long_description: product.long_description ?? product.description,
      price: product.price,
      compare_at_price: product.compare_at_price ?? null,
      featured_image_url: product.featured_image_url ?? null,
      has_variants: product.has_variants ?? false,
      is_featured: product.is_featured ?? false,
      status: "active",
      is_active: true,
      stock_quantity: product.stock_quantity ?? 50,
      stock_status: "in_stock",
      track_inventory: true,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Product ${product.slug}: ${error.message}`);
  return data.id;
}

async function seedElectronics(tenantId, categoryId) {
  const pixelId = await insertProduct(tenantId, categoryId, {
    name: "Google Pixel 7a 128GB",
    slug: "google-pixel-7a-128gb",
    sku: "FM-MOB-015",
    brand: "Google",
    subtitle: "FELLOWMATE SELECT",
    description:
      "Premium performance, exceptional camera quality and all-day battery life in a refined, durable design.",
    long_description:
      "Experience a smooth, responsive device built around a vivid display, powerful performance and reliable battery life. Its precision-crafted body feels comfortable in hand while the advanced camera system captures detail in every light.",
    price: 799,
    compare_at_price: 899,
    discount_percent: 11,
    has_variants: true,
    is_featured: true,
    featured_image_url: null,
  });

  const colorOption = await db
    .from("product_options")
    .insert({ product_id: pixelId, name: "Color", position: 0 })
    .select("id")
    .single();
  const storageOption = await db
    .from("product_options")
    .insert({ product_id: pixelId, name: "Storage", position: 1 })
    .select("id")
    .single();

  if (colorOption.error || storageOption.error) {
    throw colorOption.error ?? storageOption.error;
  }

  const colors = [
    { value: "Midnight Black", swatch_color: "#1a1a1a" },
    { value: "Snow", swatch_color: "#f5f5f5" },
    { value: "Sea", swatch_color: "#4a90d9" },
  ];
  const storages = ["128 GB", "256 GB", "512 GB"];

  for (const [i, color] of colors.entries()) {
    await db.from("product_option_values").insert({
      option_id: colorOption.data.id,
      value: color.value,
      position: i,
      swatch_color: color.swatch_color,
    });
  }
  for (const [i, storage] of storages.entries()) {
    await db.from("product_option_values").insert({
      option_id: storageOption.data.id,
      value: storage,
      position: i,
    });
  }

  const variants = [
    {
      sku: "FM-MOB-015-BLK-128",
      name: "Google Pixel 7a — Midnight Black / 128 GB",
      attributes: { Color: "Midnight Black", Storage: "128 GB" },
      price: 799,
      compare_at_price: 899,
      stock_quantity: 120,
      position: 0,
    },
    {
      sku: "FM-MOB-015-BLK-256",
      name: "Google Pixel 7a — Midnight Black / 256 GB",
      attributes: { Color: "Midnight Black", Storage: "256 GB" },
      price: 899,
      compare_at_price: 999,
      stock_quantity: 80,
      position: 1,
    },
    {
      sku: "FM-MOB-015-SEA-128",
      name: "Google Pixel 7a — Sea / 128 GB",
      attributes: { Color: "Sea", Storage: "128 GB" },
      price: 799,
      compare_at_price: 899,
      stock_quantity: 45,
      position: 2,
    },
  ];

  for (const variant of variants) {
    await db.from("product_variants").insert({
      product_id: pixelId,
      ...variant,
      is_active: true,
      stock_status: "in_stock",
    });
  }

  const specs = [
    ["Display", "6.1-inch OLED"],
    ["Processor", "Google Tensor G2"],
    ["Camera", "48MP main camera"],
    ["Warranty", "1 year manufacturer warranty"],
  ];
  for (const [i, [key, value]] of specs.entries()) {
    await db.from("product_attributes").insert({
      product_id: pixelId,
      group_name: "Specifications",
      attribute_key: key,
      attribute_value: value,
      sort_order: i,
    });
  }

  const others = [
    {
      name: "Samsung Galaxy S23 (256GB)",
      slug: "samsung-galaxy-s23-256gb",
      sku: "FM-MOB-001",
      brand: "Samsung",
      price: 699,
      compare_at_price: 849,
      is_featured: true,
    },
    {
      name: "OnePlus 11R 5G (128GB)",
      slug: "oneplus-11r-5g-128gb",
      sku: "FM-MOB-002",
      brand: "OnePlus",
      price: 499,
      compare_at_price: 599,
    },
    {
      name: "Xiaomi 13 Pro 5G (256GB)",
      slug: "xiaomi-13-pro-5g-256gb",
      sku: "FM-MOB-003",
      brand: "Xiaomi",
      price: 649,
      compare_at_price: 799,
    },
    {
      name: "Apple iPhone 15 (128GB)",
      slug: "apple-iphone-15-128gb",
      sku: "FM-MOB-004",
      brand: "Apple",
      price: 799,
      compare_at_price: 899,
      is_featured: true,
    },
    {
      name: "Samsung Galaxy A54 5G",
      slug: "samsung-galaxy-a54-5g",
      sku: "FM-MOB-005",
      brand: "Samsung",
      price: 349,
      compare_at_price: 449,
    },
    {
      name: "Realme GT Neo 5 (256GB)",
      slug: "realme-gt-neo-5-256gb",
      sku: "FM-MOB-006",
      brand: "Realme",
      price: 499,
      compare_at_price: 599,
    },
    {
      name: "iQOO Neo 7 5G (128GB)",
      slug: "iqoo-neo-7-5g-128gb",
      sku: "FM-MOB-007",
      brand: "iQOO",
      price: 389,
      compare_at_price: 469,
    },
  ];

  for (const item of others) {
    const productId = await insertProduct(tenantId, categoryId, {
      ...item,
      description: `${item.name} — premium build, sharp display, and reliable everyday performance.`,
      has_variants: false,
      stock_quantity: 60,
    });
    await db.from("product_variants").insert({
      product_id: productId,
      sku: item.sku,
      name: item.name,
      attributes: {},
      price: item.price,
      compare_at_price: item.compare_at_price,
      stock_quantity: 60,
      is_active: true,
      stock_status: "in_stock",
      position: 0,
    });
  }
}

async function seedFeaturedSamples(tenantId, categoryMap) {
  const samples = [
    {
      category: "fashion",
      name: "Minimal White Sneakers",
      slug: "minimal-white-sneakers",
      sku: "FM-FAS-001",
      price: 69,
      compare_at_price: 89,
      is_featured: true,
    },
    {
      category: "home-living",
      name: "Urban Voyager Backpack",
      slug: "urban-voyager-backpack",
      sku: "FM-HOM-001",
      price: 49.99,
      is_featured: true,
    },
    {
      category: "beauty-care",
      name: "Daily Hydrating Cleanser",
      slug: "daily-hydrating-cleanser",
      sku: "FM-BEA-001",
      price: 19.99,
      is_featured: true,
    },
    {
      category: "kitchen",
      name: "Premium Wireless Headphones",
      slug: "premium-wireless-headphones",
      sku: "FM-KIT-001",
      price: 89,
      compare_at_price: 119,
      is_featured: true,
    },
  ];

  for (const item of samples) {
    const categoryId = categoryMap[item.category];
    if (!categoryId) continue;
    const productId = await insertProduct(tenantId, categoryId, {
      ...item,
      description: `${item.name} — curated pick from FellowMart.`,
      has_variants: false,
      stock_quantity: 40,
    });
    await db.from("product_variants").insert({
      product_id: productId,
      sku: item.sku,
      name: item.name,
      attributes: {},
      price: item.price,
      compare_at_price: item.compare_at_price ?? null,
      stock_quantity: 40,
      is_active: true,
      stock_status: "in_stock",
      position: 0,
    });
  }
}

async function linkCollections(tenantId, collectionMap) {
  const { data: products } = await db
    .from("products")
    .select("id, slug, category_id")
    .eq("tenant_id", tenantId);

  const { data: categories } = await db
    .from("categories")
    .select("id, slug")
    .eq("tenant_id", tenantId);

  const catById = Object.fromEntries((categories ?? []).map((c) => [c.id, c.slug]));

  for (const product of products ?? []) {
    const catSlug = catById[product.category_id];
    const collectionId = collectionMap[catSlug] ?? collectionMap.electronics;
    if (!collectionId) continue;
    await db.from("product_collections").upsert(
      {
        product_id: product.id,
        collection_id: collectionId,
        sort_order: 0,
      },
      { onConflict: "product_id,collection_id" },
    );
  }
}

async function main() {
  console.log("Seeding FellowMart catalog…");
  const tenant = await getTenant();

  // Fresh catalog each run
  await db.from("products").delete().eq("tenant_id", tenant.id);

  const categoryMap = await getCategoryMap(tenant.id);
  const collectionMap = await getCollectionMap(tenant.id);

  const electronicsId = categoryMap.electronics;
  if (!electronicsId) {
    throw new Error("Electronics category missing. Run db push first.");
  }

  await seedElectronics(tenant.id, electronicsId);
  await seedFeaturedSamples(tenant.id, categoryMap);
  await linkCollections(tenant.id, collectionMap);

  const { count } = await db
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenant.id);

  console.log(`Done. FellowMart now has ${count ?? 0} products.`);
  console.log(`Storefront: /store/${TENANT_SLUG}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
