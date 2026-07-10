-- Tenant-scoped blog posts for storefront SEO content

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  slug text not null,
  excerpt text,
  body text not null default '',
  cover_image_url text,
  author_name text,
  meta_title text,
  meta_description text,
  meta_keywords text,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  is_active boolean not null default true,
  published_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, slug)
);

create index if not exists idx_blog_posts_tenant_published
  on blog_posts (tenant_id, status, is_active, published_at desc);

create index if not exists idx_blog_posts_tenant_sort
  on blog_posts (tenant_id, sort_order, created_at desc);

alter table blog_posts enable row level security;

drop policy if exists "Public can view published blog posts" on blog_posts;
create policy "Public can view published blog posts" on blog_posts for select using (
  status = 'published'
  and is_active = true
  and (published_at is null or published_at <= now())
  and exists (
    select 1 from tenants t
    where t.id = blog_posts.tenant_id and t.is_active = true
  )
);

drop policy if exists "Tenant managers manage blog posts" on blog_posts;
create policy "Tenant managers manage blog posts" on blog_posts for all using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = blog_posts.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = blog_posts.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

drop policy if exists "Tenant managers view all blog posts" on blog_posts;
create policy "Tenant managers view all blog posts" on blog_posts for select using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = blog_posts.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);
