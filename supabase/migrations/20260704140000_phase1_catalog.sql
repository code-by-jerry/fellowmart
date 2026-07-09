create extension if not exists pgcrypto;

create table if not exists tenant_catalog_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  hero_title text,
  hero_subtitle text,
  featured_collection_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id)
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'tenant_catalog_settings' and column_name = 'tenant_id') then
    create index if not exists idx_tenant_catalog_settings_tenant on tenant_catalog_settings(tenant_id);
  end if;

  if exists (select 1 from information_schema.columns where table_name = 'product_images' and column_name = 'product_id') then
    create index if not exists idx_product_images_product on product_images(product_id);
  end if;
end $$;
