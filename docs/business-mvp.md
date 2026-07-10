# Fellowmate Business MVP Architecture

Last updated: 2026-07-09

## Product model

Fellowmate is a **multi-tenant commerce platform**:

| Role | Who | Access |
|------|-----|--------|
| **Superadmin** | Platform operator (`/admin`) | Approve businesses, manage tenants, subscriptions, global settings |
| **Business owner / staff** | Shop owners (`/business`) | Manage their own catalog, orders, store settings |
| **Customer** | Shoppers (`/login`, storefront) | Browse, cart, checkout |

Each approved business becomes a **tenant** with:

- Public storefront: `/store/{tenant-slug}`
- Business admin: `/business/{tenant-slug}`
- Platform oversight: `/admin/dashboard/stores/{tenant-slug}/settings`

## Onboarding flows

### 1. Self-serve application (recommended)

1. User signs in at `/login`
2. Submits application at `/apply`
3. Record stored in `business_applications` with status `pending`
4. Superadmin reviews at `/admin/dashboard/applications`
5. On approve → `provisionTenant()` creates:
   - `tenants` row with business metadata
   - `tenant_memberships` owner record
   - `subscriptions` trial row
   - Owner auth user (if new email)
6. Owner signs in at `/business/login` and opens `/business`

### 2. Manual provisioning (superadmin)

1. Superadmin opens `/admin/dashboard/stores/new`
2. Enters business + owner email
3. Same `provisionTenant()` path without application record

## Business types (MVP)

- `general` — supermarket / multi-category
- `grocery`, `electronics`, `footwear`, `clothing`, `textile`
- `pharmacy`, `restaurant`, `services`

Templates and default categories per type are a **next phase**.

## Security boundaries

- **Platform admin** = `profiles.role = 'admin'` + allowlisted email only
- **Tenant access** = `tenant_memberships` with `owner|admin|staff`
- **RLS** isolates tenant data by `tenant_id`
- Owners cannot access `/admin` or other tenants

## Current implementation status

### Done in this phase

- `business_applications` table + RLS
- Tenant business metadata columns
- `/apply` onboarding form
- `/admin/dashboard/applications` approval queue
- `provisionTenant()` shared provisioning service
- `/business` owner portal (overview, products list, settings)
- Superadmin manual business creation with owner email

### Next phases

1. Business-scoped product CRUD (no superadmin cookie)
2. Category templates per `business_type`
3. Tenant branding self-service in `/business/.../settings`
4. Checkout, orders, Razorpay per tenant
5. Owner invite flow + password reset email
6. Custom domains per tenant

## Key routes

```
/apply                          → Business application form
/business/login                 → Business owner sign in
/business                       → Owner's business list
/business/[slug]                → Tenant dashboard
/business/[slug]/products       → Tenant products
/business/[slug]/settings       → Tenant settings (read MVP)

/admin/dashboard/applications   → Superadmin approval queue
/admin/dashboard/stores/new     → Manual business creation
/admin/dashboard/stores         → All tenants
/store/[slug]                   → Public storefront
/store/[slug]/products            → Public product listing
```
