-- Align legacy products table (store_id era) with tenant catalog schema

alter table products add column if not exists tenant_id uuid;
alter table products add column if not exists slug text;
alter table products add column if not exists sku text;
alter table products add column if not exists long_description text;
alter table products add column if not exists category_id uuid;
alter table products add column if not exists discount_percent numeric(5,2) not null default 0;
alter table products add column if not exists cost_price numeric(10,2);
alter table products add column if not exists images jsonb not null default '[]'::jsonb;
alter table products add column if not exists seo_title text;
alter table products add column if not exists seo_description text;
alter table products add column if not exists is_active boolean not null default true;
alter table products add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'store_id'
  ) then
    alter table products alter column store_id drop not null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_tenant_id_fkey'
  ) then
    alter table products
      add constraint products_tenant_id_fkey
      foreign key (tenant_id) references tenants(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'products_category_id_fkey'
  ) then
    alter table products
      add constraint products_category_id_fkey
      foreign key (category_id) references categories(id) on delete set null not valid;
  end if;
end $$;

create unique index if not exists idx_products_tenant_sku_unique
  on products(tenant_id, sku)
  where sku is not null and sku <> '';

create index if not exists idx_products_tenant on products(tenant_id);
create index if not exists idx_products_category on products(category_id);
