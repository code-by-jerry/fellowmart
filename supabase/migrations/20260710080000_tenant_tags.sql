-- Tenant-scoped tag catalog for dynamic product tagging

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  slug text not null,
  is_active boolean not null default true,
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, slug)
);

create index if not exists idx_tags_tenant_name
  on tags (tenant_id, name);

create index if not exists idx_tags_tenant_active
  on tags (tenant_id, is_active, name);

alter table tags enable row level security;

drop policy if exists "Public can view active tags" on tags;
create policy "Public can view active tags" on tags for select using (
  is_active = true
  and exists (
    select 1 from tenants t
    where t.id = tags.tenant_id and t.is_active = true
  )
);

drop policy if exists "Tenant managers manage tags" on tags;
create policy "Tenant managers manage tags" on tags for all using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = tags.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = tags.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

-- Backfill unique tags from existing products.tags arrays
insert into tags (tenant_id, name, slug, is_active)
select
  p.tenant_id,
  trim(tag_value) as name,
  lower(regexp_replace(trim(tag_value), '[^a-zA-Z0-9]+', '-', 'g')) as slug,
  true
from products p
cross join lateral unnest(coalesce(p.tags, '{}'::text[])) as tag_value
where trim(tag_value) <> ''
group by p.tenant_id, trim(tag_value)
on conflict (tenant_id, slug) do nothing;

-- Refresh usage counts from current product tag assignments
update tags t
set usage_count = coalesce(counts.cnt, 0),
    updated_at = now()
from (
  select
    p.tenant_id,
    lower(regexp_replace(trim(tag_value), '[^a-zA-Z0-9]+', '-', 'g')) as slug,
    count(*)::integer as cnt
  from products p
  cross join lateral unnest(coalesce(p.tags, '{}'::text[])) as tag_value
  where trim(tag_value) <> ''
  group by p.tenant_id, lower(regexp_replace(trim(tag_value), '[^a-zA-Z0-9]+', '-', 'g'))
) counts
where t.tenant_id = counts.tenant_id
  and t.slug = counts.slug;
