-- Per-tenant homepage hero slider banners (desktop + mobile images, optional product PDP link)

create table if not exists hero_banners (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  eyebrow text,
  description text,
  cta_label text not null default 'Shop Now',
  desktop_image_url text not null,
  mobile_image_url text,
  product_id uuid references products(id) on delete set null,
  link_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_hero_banners_tenant_active_sort
  on hero_banners (tenant_id, is_active, sort_order, created_at);

create index if not exists idx_hero_banners_product_id on hero_banners(product_id);

alter table hero_banners enable row level security;

drop policy if exists "Public can view active hero banners" on hero_banners;
create policy "Public can view active hero banners" on hero_banners for select using (
  is_active = true
  and exists (
    select 1 from tenants t
    where t.id = hero_banners.tenant_id and t.is_active = true
  )
);

drop policy if exists "Tenant managers manage hero banners" on hero_banners;
create policy "Tenant managers manage hero banners" on hero_banners for all using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = hero_banners.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = hero_banners.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

drop policy if exists "Tenant managers view all hero banners" on hero_banners;
create policy "Tenant managers view all hero banners" on hero_banners for select using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = hero_banners.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);
