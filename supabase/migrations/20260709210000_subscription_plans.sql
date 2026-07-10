-- Global subscription plan catalog (managed by platform admin)

create table if not exists subscription_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price_amount numeric(12, 2),
  price_currency text not null default 'INR',
  price_display text not null,
  billing_period text not null default 'monthly'
    check (billing_period in ('free', 'monthly', 'yearly', 'custom')),
  features jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscription_plans_active_sort
  on subscription_plans (is_active, sort_order, name);

alter table subscription_plans enable row level security;

drop policy if exists "Anyone can view active subscription plans" on subscription_plans;
create policy "Anyone can view active subscription plans"
  on subscription_plans for select
  using (is_active = true);

drop policy if exists "Platform admins manage subscription plans" on subscription_plans;
create policy "Platform admins manage subscription plans"
  on subscription_plans for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

insert into subscription_plans (
  slug,
  name,
  description,
  price_amount,
  price_currency,
  price_display,
  billing_period,
  features,
  is_featured,
  is_active,
  sort_order
)
values
  (
    'starter',
    'Starter',
    'Get started with a dedicated storefront and core catalog tools.',
    0,
    'INR',
    'Free',
    'free',
    '["Dedicated storefront", "Catalog management", "Order dashboard"]'::jsonb,
    false,
    true,
    0
  ),
  (
    'growth',
    'Growth',
    'Scale with collections, variants, and priority support.',
    1499,
    'INR',
    '₹1,499/mo',
    'monthly',
    '["Everything in Starter", "Collections & variants", "Priority support"]'::jsonb,
    true,
    true,
    1
  ),
  (
    'enterprise',
    'Enterprise',
    'Custom onboarding and advanced capabilities for larger teams.',
    null,
    'INR',
    'Custom',
    'custom',
    '["Multi-location", "Custom fields", "Dedicated onboarding"]'::jsonb,
    false,
    true,
    2
  )
on conflict (slug) do nothing;
