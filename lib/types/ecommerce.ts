export type CurrencyCode = "INR";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain?: string | null;
  owner_id?: string | null;
  is_active?: boolean;
  settings?: Record<string, unknown>;
  logo_url?: string | null;
  primary_color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_category_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
  icon_name?: string | null;
  product_count_text?: string | null;
}

export interface Collection {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price?: number | null;
  stock_quantity?: number;
  is_active?: boolean;
}

export interface ProductSpec {
  id: string;
  product_id: string;
  weight?: number | null;
  weight_unit?: string;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  dimension_unit?: string;
  volume?: number | null;
  volume_unit?: string;
  meta?: Record<string, unknown>;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  long_description?: string | null;
  category_id?: string | null;
  price: number;
  cost_price?: number | null;
  discount_percent?: number;
  images?: Array<Record<string, unknown>>;
  seo_title?: string | null;
  seo_description?: string | null;
  is_active?: boolean;
  variants?: ProductVariant[];
  specs?: ProductSpec | null;
}
