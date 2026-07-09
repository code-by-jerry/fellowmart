create extension if not exists pgcrypto;

alter table if exists tenants
  add column if not exists onboarding_status text not null default 'pending';

create table if not exists tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'admin' check (role in ('owner', 'admin', 'staff', 'customer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, user_id)
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  plan_name text not null default 'starter',
  status text not null default 'trial' check (status in ('trial', 'active', 'paused', 'cancelled', 'expired')),
  billing_cycle text not null default 'monthly',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id)
);

do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'tenants' and column_name = 'onboarding_status') then
    create index if not exists idx_tenants_onboarding_status on tenants(onboarding_status);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'tenant_memberships' and column_name = 'tenant_id') then
    create index if not exists idx_tenant_memberships_tenant on tenant_memberships(tenant_id);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'tenant_memberships' and column_name = 'user_id') then
    create index if not exists idx_tenant_memberships_user on tenant_memberships(user_id);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'tenant_id') then
    create index if not exists idx_subscriptions_tenant on subscriptions(tenant_id);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'subscriptions' and column_name = 'status') then
    create index if not exists idx_subscriptions_status on subscriptions(status);
  end if;
end $$;
