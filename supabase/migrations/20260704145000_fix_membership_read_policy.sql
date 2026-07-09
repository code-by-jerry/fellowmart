-- Simplify tenant membership policies so they do not recurse through tenant_memberships itself

alter table tenant_memberships enable row level security;

drop policy if exists "Platform admins manage memberships" on tenant_memberships;
drop policy if exists "Tenant owners manage memberships" on tenant_memberships;
drop policy if exists "Allow read for tenant membership checks" on tenant_memberships;

create policy "Users can view own memberships" on tenant_memberships
  for select using (user_id = auth.uid());

create policy "Platform admins manage memberships" on tenant_memberships
  for all using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  ) with check (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "Tenant owners manage memberships" on tenant_memberships
  for all using (
    exists (select 1 from tenants t where t.id = tenant_memberships.tenant_id and t.owner_id = auth.uid())
  ) with check (
    exists (select 1 from tenants t where t.id = tenant_memberships.tenant_id and t.owner_id = auth.uid())
  );
