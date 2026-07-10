-- Align legacy orders table with checkout + Razorpay requirements.

alter table orders add column if not exists order_number text;
alter table orders add column if not exists user_id uuid;
alter table orders add column if not exists customer_email text;
alter table orders add column if not exists subtotal numeric(10, 2) not null default 0;
alter table orders add column if not exists shipping_amount numeric(10, 2) not null default 0;
alter table orders add column if not exists discount_amount numeric(10, 2) not null default 0;
alter table orders add column if not exists tax_amount numeric(10, 2) not null default 0;
alter table orders add column if not exists shipping_address jsonb not null default '{}'::jsonb;
alter table orders add column if not exists billing_address jsonb;
alter table orders add column if not exists notes text;
alter table orders add column if not exists updated_at timestamptz not null default now();

-- order_items: support variant-based checkout lines on older schemas
alter table order_items add column if not exists product_variant_id uuid references product_variants(id);
alter table order_items add column if not exists unit_price numeric(10, 2) not null default 0;
alter table order_items add column if not exists total_price numeric(10, 2) not null default 0;

-- transactions table for Razorpay (no-op if already created)
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  payment_method text not null default 'razorpay',
  razorpay_payment_id text,
  razorpay_order_id text,
  amount numeric(10, 2) not null default 0,
  currency text not null default 'INR',
  status text not null default 'pending',
  response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_transactions_order on transactions(order_id);
create index if not exists idx_transactions_tenant on transactions(tenant_id);
