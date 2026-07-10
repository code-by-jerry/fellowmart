-- Shopify-style custom store pages (About, Policies, Shipping, etc.)

create table if not exists store_pages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  slug text not null,
  body text not null default '',
  meta_title text,
  meta_description text,
  footer_group text not null default 'company'
    check (footer_group in ('company', 'help', 'none')),
  show_in_footer boolean not null default true,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, slug)
);

create index if not exists idx_store_pages_tenant_footer
  on store_pages (tenant_id, show_in_footer, footer_group, sort_order)
  where status = 'published' and is_active = true;

create index if not exists idx_store_pages_tenant_slug
  on store_pages (tenant_id, slug);

alter table store_pages enable row level security;

drop policy if exists "Public can view published store pages" on store_pages;
create policy "Public can view published store pages" on store_pages for select using (
  status = 'published'
  and is_active = true
  and exists (
    select 1 from tenants t
    where t.id = store_pages.tenant_id and t.is_active = true
  )
);

drop policy if exists "Tenant managers manage store pages" on store_pages;
create policy "Tenant managers manage store pages" on store_pages for all using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = store_pages.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = store_pages.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

drop policy if exists "Tenant managers view all store pages" on store_pages;
create policy "Tenant managers view all store pages" on store_pages for select using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = store_pages.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);
