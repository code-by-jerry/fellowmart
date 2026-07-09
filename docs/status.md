# Current Development Stage: **Phase 2 — Catalog and storefront foundation**

## Completed ✅

- **Phase 1 complete:** Tenant onboarding, tenant membership, and subscription lifecycle are implemented.
- **Tenant onboarding:** Tenant/store creation is working with owner assignment and onboarding status.
- **Tenant membership model:** Tenant owners are recorded as `tenant_memberships` and can be managed.
- **Subscription lifecycle:** New tenants receive a trial subscription state and active status.
- **Tenant admin management:** Admin-facing tenant list shows onboarding status, active/inactive state, and subscription summary.
- **Tenant settings polish:** Tenant settings now support onboarding status updates, subscription plan selection, and subscription status updates.
- **Database and RLS:** Core tables and row-level security are in place for tenants, memberships, subscriptions, stores, products, carts, orders, and related access rules.
- **Validation coverage:** RLS test script now validates Phase 1 products, carts, and order access behavior.

## In Progress 🔄

- **Catalog and storefront foundation:** Product admin CRUD, category/collection support, and public storefront pages.
- **Shopping experience:** Cart workflow and checkout flow are still evolving.
- **Tenant settings UI:** Tenant settings and storefront branding pages need more polish.

## Next Phase 🔜

- **Phase 2 work:** Product management screens, storefront listing pages, category/collection browsing, and public product discovery.
- **Goal:** Move from tenant onboarding into full catalog and storefront functionality.
