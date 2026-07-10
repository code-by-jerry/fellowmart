-- Tenant-scoped product brands for catalog onboarding

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  logo_url text,
  website_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, slug)
);

create index if not exists idx_brands_tenant_active_sort
  on brands (tenant_id, is_active, sort_order, name);

alter table products
  add column if not exists brand_id uuid references brands(id) on delete set null;

create index if not exists idx_products_brand_id on products(brand_id);

alter table brands enable row level security;

drop policy if exists "Public can view active brands" on brands;
create policy "Public can view active brands" on brands for select using (
  is_active = true
  and exists (
    select 1 from tenants t
    where t.id = brands.tenant_id and t.is_active = true
  )
);

drop policy if exists "Tenant managers manage brands" on brands;
create policy "Tenant managers manage brands" on brands for all using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = brands.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = brands.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

drop policy if exists "Tenant managers view all brands" on brands;
create policy "Tenant managers view all brands" on brands for select using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = brands.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

-- Backfill brands from existing free-text product.brand values
insert into brands (tenant_id, name, slug, sort_order, is_active)
select
  p.tenant_id,
  trim(p.brand) as name,
  lower(regexp_replace(trim(p.brand), '[^a-zA-Z0-9]+', '-', 'g')) as slug,
  0,
  true
from products p
where p.brand is not null
  and trim(p.brand) <> ''
group by p.tenant_id, trim(p.brand)
on conflict (tenant_id, slug) do nothing;

update products p
set brand_id = b.id
from brands b
where p.brand_id is null
  and p.brand is not null
  and trim(p.brand) <> ''
  and b.tenant_id = p.tenant_id
  and b.name = trim(p.brand);
