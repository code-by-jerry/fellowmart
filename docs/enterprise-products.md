# Enterprise Product Catalog

Last updated: 2026-07-09

## Field groups

Products are organized into **11 enterprise sections** in the business portal:

| Group | Purpose |
|-------|---------|
| **Basic Information** | Name, slug, brand, subtitle, descriptions, category, tags, status |
| **Identification & SKU** | Base SKU, barcode, MPN, GTIN, HS code, variant flag |
| **Pricing** | Price, compare-at, cost, tax class (simple products) |
| **Inventory** | Track stock, quantity, low-stock threshold, backorders |
| **Shipping & Dimensions** | Weight, L×W×H, shipping class |
| **Media** | Featured image and gallery |
| **SEO & Marketing** | SEO title, description, meta keywords |
| **Variant Options** | Option axes (Color, Size, Storage) with swatches |
| **Variants & SKUs** | Per-variant SKU, price, stock, barcode |
| **Specifications** | Structured attribute key-value pairs |
| **Custom Fields** | Tenant-defined fields (product / variant / both) |

## SKU model

- **Base SKU** — parent identifier on `products.sku` (e.g. `FM-MOB-015`)
- **Variant SKU** — sellable unit on `product_variants.sku` (e.g. `FM-MOB-015-BLK-128`)
- Cart and orders reference `product_variant_id`

## Custom fields

Tenants define reusable fields in `product_field_definitions`:

- Types: text, textarea, number, boolean, select, multi_select, url, date, color
- Scope: product, variant, or both
- Values stored in `product_custom_values` / `product_variant_custom_values`

## Business routes

```
/business/[slug]/products              → Product list
/business/[slug]/products/new          → Create (enterprise form)
/business/[slug]/products/[id]/edit     → Edit
```

## API

```
POST /api/business/products/create
PUT  /api/business/products/update
GET  /api/business/products/field-definitions?tenant_slug=
POST /api/business/products/field-definitions
```
