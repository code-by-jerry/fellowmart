-- Per-tenant store branding, SEO, and page content (owned by store managers)
-- Platform admin manages tenant ops only; store customization is self-serve.

alter table tenants
  add column if not exists favicon_url text,
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists meta_keywords text,
  add column if not exists announcement_text text,
  add column if not exists announcement_promo text,
  add column if not exists footer_description text,
  add column if not exists home_hero_eyebrow text,
  add column if not exists home_hero_title text,
  add column if not exists home_hero_description text;

-- Allow store owners/admins to update their own tenant branding (not platform-only)
drop policy if exists "Tenant managers update store branding" on tenants;
create policy "Tenant managers update store branding" on tenants
  for update using (
    exists (
      select 1 from tenant_memberships tm
      where tm.tenant_id = tenants.id
        and tm.user_id = auth.uid()
        and tm.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from tenant_memberships tm
      where tm.tenant_id = tenants.id
        and tm.user_id = auth.uid()
        and tm.role in ('owner', 'admin')
    )
  );

-- Team access requests: store managers request members; platform admin fulfills
create table if not exists team_access_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  requested_by uuid not null references profiles(id) on delete cascade,
  member_email text not null,
  requested_role text not null check (requested_role in ('admin', 'staff')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_team_access_requests_tenant
  on team_access_requests(tenant_id, status);

alter table team_access_requests enable row level security;

drop policy if exists "Managers read own team requests" on team_access_requests;
create policy "Managers read own team requests" on team_access_requests
  for select using (
    exists (
      select 1 from tenant_memberships tm
      where tm.tenant_id = team_access_requests.tenant_id
        and tm.user_id = auth.uid()
        and tm.role in ('owner', 'admin')
    )
  );

drop policy if exists "Managers create team requests" on team_access_requests;
create policy "Managers create team requests" on team_access_requests
  for insert with check (
    requested_by = auth.uid()
    and exists (
      select 1 from tenant_memberships tm
      where tm.tenant_id = team_access_requests.tenant_id
        and tm.user_id = auth.uid()
        and tm.role in ('owner', 'admin')
    )
  );

drop policy if exists "Managers cancel own team requests" on team_access_requests;
create policy "Managers cancel own team requests" on team_access_requests
  for update using (
    exists (
      select 1 from tenant_memberships tm
      where tm.tenant_id = team_access_requests.tenant_id
        and tm.user_id = auth.uid()
        and tm.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from tenant_memberships tm
      where tm.tenant_id = team_access_requests.tenant_id
        and tm.user_id = auth.uid()
        and tm.role in ('owner', 'admin')
    )
  );

drop policy if exists "Platform admins manage team requests" on team_access_requests;
create policy "Platform admins manage team requests" on team_access_requests
  for all using (
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
