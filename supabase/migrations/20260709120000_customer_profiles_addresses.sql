-- Extend profiles with customer contact / marketing fields
alter table profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

-- Saved delivery addresses (user-scoped, reusable at checkout)
create table if not exists customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home' check (label in ('Home', 'Work', 'Other')),
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  landmark text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'IN',
  latitude double precision,
  longitude double precision,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customer_addresses_user on customer_addresses(user_id);
create index if not exists idx_customer_addresses_default on customer_addresses(user_id, is_default);

-- Keep only one default address per user
create or replace function public.ensure_single_default_address()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_default then
    update public.customer_addresses
    set is_default = false, updated_at = now()
    where user_id = new.user_id and id is distinct from new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_customer_addresses_single_default on customer_addresses;
create trigger trg_customer_addresses_single_default
  before insert or update of is_default on customer_addresses
  for each row
  execute function public.ensure_single_default_address();

-- Auto-default first address for a user
create or replace function public.default_first_customer_address()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.customer_addresses
    where user_id = new.user_id and id is distinct from new.id
  ) then
    new.is_default := true;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_customer_addresses_first_default on customer_addresses;
create trigger trg_customer_addresses_first_default
  before insert on customer_addresses
  for each row
  execute function public.default_first_customer_address();

-- Seed profile name from OAuth metadata when available
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    )
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(profiles.full_name, excluded.full_name),
    updated_at = now();

  return new;
end;
$$;

alter table customer_addresses enable row level security;

drop policy if exists "Users can view own addresses" on customer_addresses;
create policy "Users can view own addresses"
  on customer_addresses for select
  using (user_id = auth.uid());

drop policy if exists "Users can insert own addresses" on customer_addresses;
create policy "Users can insert own addresses"
  on customer_addresses for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can update own addresses" on customer_addresses;
create policy "Users can update own addresses"
  on customer_addresses for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete own addresses" on customer_addresses;
create policy "Users can delete own addresses"
  on customer_addresses for delete
  using (user_id = auth.uid());
