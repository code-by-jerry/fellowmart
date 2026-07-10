export type ProductStatus = "draft" | "active" | "archived";
export type StockStatus = "in_stock" | "out_of_stock" | "low_stock" | "backorder";
export type CustomFieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "multi_select"
  | "url"
  | "date"
  | "color";
export type CustomFieldAppliesTo = "product" | "variant" | "both";

/** UI section groupings for the enterprise product form */
export const PRODUCT_FIELD_GROUPS = {
  basic: {
    id: "basic",
    label: "Basic Information",
    description: "Core product identity and categorization",
    fields: [
      "name",
      "slug",
      "brand",
      "subtitle",
      "description",
      "long_description",
      "category_id",
      "collection_ids",
      "tags",
      "status",
      "is_featured",
      "is_active",
    ],
  },
  identification: {
    id: "identification",
    label: "Identification & SKU",
    description: "Base SKU, barcodes, and regulatory identifiers",
    fields: ["sku", "barcode", "mpn", "gtin", "hs_code", "has_variants"],
  },
  pricing: {
    id: "pricing",
    label: "Pricing",
    description: "Selling price, compare-at, cost, and tax settings",
    fields: [
      "price",
      "compare_at_price",
      "cost_price",
      "discount_percent",
      "tax_class",
      "taxable",
    ],
  },
  inventory: {
    id: "inventory",
    label: "Inventory",
    description: "Stock tracking and availability (simple products)",
    fields: [
      "track_inventory",
      "stock_quantity",
      "low_stock_threshold",
      "allow_backorder",
      "stock_status",
    ],
  },
  shipping: {
    id: "shipping",
    label: "Shipping & Dimensions",
    description: "Physical properties and shipping configuration",
    fields: [
      "weight",
      "weight_unit",
      "length",
      "width",
      "height",
      "dimension_unit",
      "requires_shipping",
      "shipping_class",
    ],
  },
  media: {
    id: "media",
    label: "Media",
    description: "Product images and featured image",
    fields: ["featured_image_url", "images"],
  },
  seo: {
    id: "seo",
    label: "SEO & Marketing",
    description: "Search engine and discovery metadata",
    fields: ["seo_title", "seo_description", "meta_keywords"],
  },
  options: {
    id: "options",
    label: "Variant Options",
    description: "Option axes such as Color, Size, Storage",
    fields: ["options"],
  },
  variants: {
    id: "variants",
    label: "Variants & SKUs",
    description: "Sellable SKUs with per-variant pricing and inventory",
    fields: ["variants"],
  },
  specifications: {
    id: "specifications",
    label: "Specifications",
    description: "Structured attribute key-value pairs",
    fields: ["attributes"],
  },
  custom: {
    id: "custom",
    label: "Custom Fields",
    description: "Tenant-defined fields for product and variant data",
    fields: ["custom_fields", "field_definitions"],
  },
} as const;

export type ProductFieldGroupId = keyof typeof PRODUCT_FIELD_GROUPS;

export interface ProductFieldDefinition {
  id?: string;
  tenant_id?: string;
  field_key: string;
  label: string;
  field_type: CustomFieldType;
  field_group: string;
  description?: string | null;
  options?: string[];
  is_required?: boolean;
  applies_to: CustomFieldAppliesTo;
  sort_order?: number;
  is_active?: boolean;
}

export interface ProductOptionValueInput {
  id?: string;
  value: string;
  position?: number;
  swatch_color?: string | null;
  swatch_image_url?: string | null;
}

export interface ProductOptionInput {
  id?: string;
  name: string;
  position?: number;
  values: ProductOptionValueInput[];
}

export interface ProductVariantInput {
  id?: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  price?: number | null;
  compare_at_price?: number | null;
  cost_price?: number | null;
  barcode?: string | null;
  weight?: number | null;
  weight_unit?: string;
  image_url?: string | null;
  stock_quantity?: number;
  low_stock_threshold?: number;
  allow_backorder?: boolean;
  stock_status?: StockStatus;
  position?: number;
  is_active?: boolean;
  custom_fields?: Record<string, unknown>;
}

export interface ProductAttributeInput {
  id?: string;
  group_name?: string;
  attribute_key: string;
  attribute_value: string;
  sort_order?: number;
}

export interface ProductImageInput {
  id?: string;
  url: string;
  alt_text?: string | null;
  sort_order?: number;
}

export interface ProductFormInput {
  name: string;
  slug: string;
  brand?: string | null;
  brand_id?: string | null;
  subtitle?: string | null;
  description?: string | null;
  long_description?: string | null;
  category_id?: string | null;
  collection_ids?: string[];
  tags?: string[];
  status?: ProductStatus;
  is_featured?: boolean;
  is_active?: boolean;

  sku: string;
  barcode?: string | null;
  mpn?: string | null;
  gtin?: string | null;
  hs_code?: string | null;
  has_variants?: boolean;

  price?: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  discount_percent?: number;
  tax_class?: string;
  taxable?: boolean;

  track_inventory?: boolean;
  stock_quantity?: number;
  low_stock_threshold?: number;
  allow_backorder?: boolean;
  stock_status?: StockStatus;

  weight?: number | null;
  weight_unit?: string;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  dimension_unit?: string;
  requires_shipping?: boolean;
  shipping_class?: string | null;

  featured_image_url?: string | null;
  images?: ProductImageInput[];

  seo_title?: string | null;
  seo_description?: string | null;
  meta_keywords?: string[];

  options?: ProductOptionInput[];
  variants?: ProductVariantInput[];
  attributes?: ProductAttributeInput[];
  custom_fields?: Record<string, unknown>;
  new_field_definitions?: ProductFieldDefinition[];
}

export interface ProductRecord extends ProductFormInput {
  id: string;
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_PRODUCT_FORM: ProductFormInput = {
  name: "",
  slug: "",
  brand: "",
  brand_id: null,
  subtitle: "",
  description: "",
  long_description: "",
  category_id: null,
  collection_ids: [],
  tags: [],
  status: "draft",
  is_featured: false,
  is_active: false,
  sku: "",
  barcode: "",
  mpn: "",
  gtin: "",
  hs_code: "",
  has_variants: false,
  price: 0,
  compare_at_price: null,
  cost_price: null,
  discount_percent: 0,
  tax_class: "standard",
  taxable: true,
  track_inventory: true,
  stock_quantity: 0,
  low_stock_threshold: 5,
  allow_backorder: false,
  stock_status: "in_stock",
  weight: null,
  weight_unit: "kg",
  length: null,
  width: null,
  height: null,
  dimension_unit: "cm",
  requires_shipping: true,
  shipping_class: "",
  featured_image_url: "",
  images: [],
  seo_title: "",
  seo_description: "",
  meta_keywords: [],
  options: [],
  variants: [],
  attributes: [],
  custom_fields: {},
  new_field_definitions: [],
};
