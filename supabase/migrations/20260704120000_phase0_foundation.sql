create extension if not exists pgcrypto;

alter table if exists categories add column if not exists tenant_id uuid;
alter table if exists collections add column if not exists tenant_id uuid;
alter table if exists products add column if not exists tenant_id uuid;
alter table if exists products add column if not exists category_id uuid;
alter table if exists products add column if not exists slug text;
alter table if exists products add column if not exists sku text;
alter table if exists products add column if not exists price numeric(10,2);
alter table if exists products add column if not exists is_active boolean;
alter table if exists product_variants add column if not exists product_id uuid;
alter table if exists carts add column if not exists tenant_id uuid;
alter table if exists orders add column if not exists tenant_id uuid;
alter table if exists transactions add column if not exists tenant_id uuid;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  subdomain text unique,
  owner_id uuid,
  is_active boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  logo_url text,
  primary_color text default '#0f172a',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  image_url text,
  parent_category_id uuid references categories(id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, slug)
);

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, slug)
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  sku text not null,
  description text,
  long_description text,
  category_id uuid references categories(id) on delete set null,
  price numeric(10,2) not null default 0,
  cost_price numeric(10,2),
  discount_percent numeric(5,2) not null default 0,
  images jsonb not null default '[]'::jsonb,
  seo_title text,
  seo_description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, sku)
);

create table if not exists product_collections (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  collection_id uuid not null references collections(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(product_id, collection_id)
);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  sku text not null,
  name text not null,
  attributes jsonb not null default '{}'::jsonb,
  price numeric(10,2),
  stock_quantity integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, sku)
);

create table if not exists product_specs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  weight numeric(10,2),
  weight_unit text default 'kg',
  length numeric(10,2),
  width numeric(10,2),
  height numeric(10,2),
  dimension_unit text default 'cm',
  volume numeric(10,2),
  volume_unit text default 'ml',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid,
  session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_variant_id uuid not null references product_variants(id) on delete cascade,
  quantity integer not null default 1,
  added_at timestamptz not null default now(),
  unique(cart_id, product_variant_id)
);

create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  unique(tenant_id, user_id)
);

create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references wishlists(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique(wishlist_id, product_id)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  order_number text not null unique,
  user_id uuid,
  customer_email text not null,
  customer_name text not null,
  status text not null default 'pending',
  total_amount numeric(10,2) not null default 0,
  subtotal numeric(10,2) not null default 0,
  shipping_amount numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  shipping_address jsonb not null default '{}'::jsonb,
  billing_address jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_variant_id uuid not null references product_variants(id),
  quantity integer not null default 1,
  unit_price numeric(10,2) not null default 0,
  total_price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  payment_method text not null default 'razorpay',
  razorpay_payment_id text,
  razorpay_order_id text,
  amount numeric(10,2) not null default 0,
  currency text not null default 'INR',
  status text not null default 'pending',
  response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'categories' and column_name = 'tenant_id') then
    create index if not exists idx_categories_tenant on categories(tenant_id);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'categories' and column_name = 'parent_category_id') then
    create index if not exists idx_categories_parent on categories(parent_category_id);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'collections' and column_name = 'tenant_id') then
    create index if not exists idx_collections_tenant on collections(tenant_id);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'tenant_id') then
    create index if not exists idx_products_tenant on products(tenant_id);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'category_id') then
    create index if not exists idx_products_category on products(category_id);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'tenant_id') and exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'slug') then
    create index if not exists idx_products_slug on products(tenant_id, slug);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'product_variants' and column_name = 'product_id') then
    create index if not exists idx_product_variants_product on product_variants(product_id);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'carts' and column_name = 'tenant_id') then
    create index if not exists idx_carts_tenant on carts(tenant_id);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'tenant_id') then
    create index if not exists idx_orders_tenant on orders(tenant_id);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'user_id') then
    create index if not exists idx_orders_user on orders(user_id);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'order_id') then
    create index if not exists idx_transactions_order on transactions(order_id);
  end if;
end $$;
