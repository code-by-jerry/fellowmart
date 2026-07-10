-- Per-tenant shopper CRM (reach), separate from staff memberships and platform profiles.
-- Backfill from orders is optional and done only when order customer columns exist.

create table if not exists tenant_customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  email text not null,
  name text,
  phone text,
  source text not null default 'visit'
    check (source in ('visit', 'login', 'order', 'import', 'signup')),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  order_count integer not null default 0,
  total_spent numeric(12,2) not null default 0,
  last_order_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_tenant_customers_tenant_user
  on tenant_customers (tenant_id, user_id)
  where user_id is not null;

create unique index if not exists idx_tenant_customers_tenant_email
  on tenant_customers (tenant_id, lower(email));

create index if not exists idx_tenant_customers_tenant_seen
  on tenant_customers (tenant_id, last_seen_at desc);

alter table tenant_customers enable row level security;

drop policy if exists "Tenant managers read store customers" on tenant_customers;
create policy "Tenant managers read store customers" on tenant_customers
  for select using (public.is_tenant_manager(tenant_id));

drop policy if exists "Platform admins read store customers" on tenant_customers;
create policy "Platform admins read store customers" on tenant_customers
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
