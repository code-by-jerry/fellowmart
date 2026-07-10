-- Per-tenant display currency + cached FX rates (base catalog currency = INR)

alter table tenants
  add column if not exists currency text not null default 'INR'
    check (currency in ('INR', 'USD', 'EUR', 'AED'));

create table if not exists currency_rates (
  base_currency text not null default 'INR',
  rates jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  source text not null default 'open.er-api.com',
  primary key (base_currency)
);

alter table currency_rates enable row level security;

drop policy if exists "Anyone can read currency rates" on currency_rates;
create policy "Anyone can read currency rates" on currency_rates
  for select using (true);
