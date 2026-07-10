# Fellomate SaaS Architecture

Last updated: 2026-07-09

## Three portals

| Portal | URL | Who | Purpose |
|--------|-----|-----|---------|
| **Marketing** | `/` | Public | Fellomate SaaS landing, apply, sign-in links |
| **Platform admin** | `/admin/*` | Platform operator | Tenants, applications, customers, settings |
| **Business** | `/business/*` | Store owners/staff | Catalog, orders, subscription per tenant |
| **Storefront** | `/store/{slug}/*` | Shoppers | Public shop — same templates, tenant data |

## Storefront templates (reused)

All shopper UI uses `CustomerStoreLayout` + existing CSS modules:

- `/store/{slug}` — home
- `/store/{slug}/categories` — category grid
- `/store/{slug}/categories/{cat}` — PLP
- `/store/{slug}/categories/{cat}/{product}` — PDP
- `/store/{slug}/cart` — cart

Tenant resolved via `getStorefrontContext(slug)` → queries scoped by `tenant_id`.

## Legacy redirects

- `/categories/*` → `/store/fellowmart/categories/*`
- `/{slug}/*` → `/store/{slug}/*` (proxy)

## Data isolation

Shared schema + `tenant_id` + RLS. Onboarding uses `provisionTenant()`, not per-tenant migrations.
