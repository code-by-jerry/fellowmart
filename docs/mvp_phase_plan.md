# FellowMart MVP Phase Plan

Last updated: 2026-07-04

## 1. Product goal

FellowMart should let a small business owner move from sign-up to a live online store in one clear flow.

The MVP should support:

- User sign-up and login
- Tenant or business creation
- Subscription and onboarding state for each tenant
- Product catalog management
- Public storefront browsing
- Cart and wishlist
- Checkout and payment
- Order management and admin controls

## 2. End-to-end product flow

The development plan should follow the same journey a real user experiences:

1. A user signs up or logs in.
2. The user creates or joins a tenant.
3. The tenant is placed into onboarding and gets an active or trial subscription state.
4. The tenant admin adds categories, collections, and products.
5. Customers visit the storefront and browse products.
6. Customers add products to cart or wishlist.
7. Customers proceed to checkout.
8. Payment is created and verified through Razorpay.
9. An order and transaction are created and stored.
10. The tenant admin manages orders and store settings.

This is the cleanest path because it keeps auth, tenancy, subscriptions, catalog, checkout, and admin operations connected.

## 3. Core architecture decisions

### 3.1 Authentication

- Use Supabase Auth for sign-up, login, and password recovery.
- Maintain a user profile table for app-level metadata.
- Support platform admin, tenant admin, tenant staff, and customer roles.

### 3.2 Tenant model

- Every store is a tenant.
- Each tenant has its own slug, name, and settings.
- Tenant-scoped data is isolated by tenant_id.
- Tenant access is controlled through memberships and roles.

### 3.3 Subscription and onboarding

- Each tenant should have a subscription or onboarding state.
- Suggested states: trial, active, paused, cancelled, expired.
- Platform admins can monitor tenant activation and billing status.
- Onboarding is part of the product flow rather than a separate add-on.

### 3.4 Commerce model

- Products belong to a tenant.
- Products can have categories, collections, and variants.
- Orders and transactions are tenant-scoped.
- Payments are handled through Razorpay in test mode for the MVP.

## 4. Core database foundation

The MVP should include these core tables:

- users/profile data
- tenants
- tenant_memberships
- subscriptions
- categories
- collections
- products
- product_variants
- product_specs
- carts
- cart_items
- wishlists
- wishlist_items
- orders
- order_items
- transactions

Every tenant-scoped table should include tenant_id.

## 5. Phase-by-phase implementation plan

### Phase 0 — Authentication and account foundation

Goal:

- Create the identity layer that powers the rest of the product.

Scope:

- Sign-up and login flow
- Password recovery flow
- User profile storage
- Role definitions for platform admin and tenant admin
- Protected routes and auth helpers

Deliverables:

- Auth screens
- Profile model
- Server-side auth utilities
- Route protection

Acceptance criteria:

- A user can sign up and log in
- The app can identify the current user role
- Auth-protected pages are secure

### Phase 1 — Tenant onboarding and subscription lifecycle

Goal:

- Let a business owner create a store and move through onboarding with an explicit admin approval pipeline.

Scope:

- Tenant creation flow
- Tenant owner/admin assignment and memberships
- Platform admin tenant management view
- Subscription state and lifecycle
- Tenant settings and branding basics
- Admin workflow for approval and onboarding completion

Deliverables:

- Tenant onboarding screens
- Tenant settings page
- Subscription state model
- Tenant owner membership creation
- Platform admin store list with approve/activate actions
- Tenant membership management flow

Acceptance criteria:

- A user can create a tenant
- The tenant is created with an owner membership
- The tenant starts in pending/inactive state
- A platform admin can approve the tenant and activate the subscription
- A tenant settings page is available for store-level settings and membership management
- Owner/admin membership rules are enforced

Current blocker:

- Admin-managed tenant approval and subscription activation are not fully wired yet
- Tenant settings and membership management routes need stable handling
- The workflow must prevent downstream actions before approval

Status: Phase 1 is in progress. The current blocker is finalizing the admin-managed onboarding and subscription activation workflow.

### Phase 2 — Catalog and storefront foundation

Goal:

- Enable a tenant admin to manage products and publish them publicly.

Scope:

- Category CRUD
- Collection CRUD
- Product CRUD
- Product images and descriptions
- Product variants and basic specs
- Public product listing and detail pages

Deliverables:

- Admin product management screens
- Product list and detail pages
- Category and collection pages
- Storefront shell

Acceptance criteria:

- A tenant admin can create and edit products
- Products appear on the public storefront
- Customers can browse products by category or collection

### Phase 3 — Cart and wishlist experience

Goal:

- Build the basic shopping experience for customers.

Scope:

- Add-to-cart behavior
- Cart drawer or sidebar
- Wishlist support
- Cart summary and quantity controls
- Guest cart support and logged-in cart continuity

Deliverables:

- Cart state handling
- Wishlist state handling
- Storefront navigation and cart UI
- Empty states and cart summary

Acceptance criteria:

- A customer can add products to cart
- A customer can add products to wishlist
- Cart contents are shown consistently across the storefront

### Phase 4 — Checkout, payment, and order creation

Goal:

- Allow customers to complete purchases end to end.

Scope:

- Checkout page
- Customer details and address form
- Razorpay order creation
- Payment verification
- Order creation and transaction storage
- Order confirmation screen

Deliverables:

- Checkout flow
- Razorpay integration
- Order and transaction persistence
- Success and failure states

Acceptance criteria:

- A customer can place an order
- Razorpay creates and verifies a payment
- An order and transaction are saved correctly
- The customer sees a confirmation screen

### Phase 5 — Admin order and store operations

Goal:

- Let tenant admins manage orders and store activity.

Scope:

- Order list and order detail pages
- Order status updates
- Inventory status updates
- Store settings and branding basics
- Basic reporting or visibility for order volume

Deliverables:

- Admin dashboard screens
- Order management UI
- Product status controls
- Store settings page

Acceptance criteria:

- A tenant admin can view orders for their store
- The admin can update order state
- Basic store operations are usable from the dashboard

### Phase 6 — Polish and launch readiness

Goal:

- Make the MVP reliable enough for internal demo and early testing.

Scope:

- Validation and form feedback
- Better loading and empty states
- Error handling and retry flows
- SEO basics for product pages
- Deployment cleanup and performance pass

Deliverables:

- Polished storefront and admin UI
- Stable error handling
- Deployment-ready configuration

Acceptance criteria:

- The app is stable for internal testing
- The core flow works from signup to payment confirmation
- The project is ready for a first demo deployment

## 6. Recommended implementation order

1. Authentication and user roles
2. Tenant creation and membership model
3. Subscription and onboarding state
4. Storefront and catalog data model
5. Product management screens
6. Cart and wishlist flows
7. Checkout and Razorpay payment flow
8. Orders, transaction history, and admin controls
9. Polish, testing, and deployment

## 7. Definition of done for the MVP

The MVP is complete when:

- A user can sign up and log in
- A business can create a tenant and start onboarding
- A tenant admin can add products and publish them
- Customers can browse products and place an order
- Razorpay payments work in test mode
- Orders and transactions are stored correctly
- Tenant admins can manage orders and store settings

## 8. Immediate next step

Start from Phase 0 in this order:

1. Auth and user profile setup
2. Tenant, membership, and subscription tables
3. Tenant-aware RLS and access rules
4. Basic tenant admin dashboard
5. First storefront product listing page
