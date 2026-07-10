-- Lightweight in-app notifications + activity logs (platform + store)

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('platform', 'tenant')),
  tenant_id uuid references tenants(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  href text,
  actor_id uuid references profiles(id) on delete set null,
  meta jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_audience_tenant check (
    (audience = 'platform' and tenant_id is null)
    or (audience = 'tenant' and tenant_id is not null)
  )
);

create index if not exists idx_notifications_platform_unread
  on notifications (created_at desc)
  where audience = 'platform' and read_at is null;

create index if not exists idx_notifications_tenant
  on notifications (tenant_id, created_at desc)
  where audience = 'tenant';

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('platform', 'tenant')),
  tenant_id uuid references tenants(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text,
  entity_id text,
  summary text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint activity_logs_scope_tenant check (
    (scope = 'platform' and tenant_id is null)
    or (scope = 'tenant' and tenant_id is not null)
  )
);

create index if not exists idx_activity_logs_platform
  on activity_logs (created_at desc)
  where scope = 'platform';

create index if not exists idx_activity_logs_tenant
  on activity_logs (tenant_id, created_at desc)
  where scope = 'tenant';

alter table notifications enable row level security;
alter table activity_logs enable row level security;

-- Platform admins see platform notifications
drop policy if exists "Platform admins read platform notifications" on notifications;
create policy "Platform admins read platform notifications" on notifications
  for select using (
    audience = 'platform'
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Platform admins update platform notifications" on notifications;
create policy "Platform admins update platform notifications" on notifications
  for update using (
    audience = 'platform'
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  )
  with check (
    audience = 'platform'
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Tenant managers see their store notifications
drop policy if exists "Tenant managers read tenant notifications" on notifications;
create policy "Tenant managers read tenant notifications" on notifications
  for select using (
    audience = 'tenant'
    and tenant_id is not null
    and public.is_tenant_manager(tenant_id)
  );

drop policy if exists "Tenant managers update tenant notifications" on notifications;
create policy "Tenant managers update tenant notifications" on notifications
  for update using (
    audience = 'tenant'
    and tenant_id is not null
    and public.is_tenant_manager(tenant_id)
  )
  with check (
    audience = 'tenant'
    and tenant_id is not null
    and public.is_tenant_manager(tenant_id)
  );

-- Activity logs: read-only for clients; writes via service role
drop policy if exists "Platform admins read platform activity" on activity_logs;
create policy "Platform admins read platform activity" on activity_logs
  for select using (
    scope = 'platform'
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Tenant managers read tenant activity" on activity_logs;
create policy "Tenant managers read tenant activity" on activity_logs
  for select using (
    scope = 'tenant'
    and tenant_id is not null
    and public.is_tenant_manager(tenant_id)
  );
