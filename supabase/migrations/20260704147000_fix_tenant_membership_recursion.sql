-- Break recursion between tenants and tenant_memberships policies

alter table tenants enable row level security;
alter table tenant_memberships enable row level security;

drop policy if exists "Platform admins can view tenants" on tenants;
drop policy if exists "Tenant owners/admins can manage tenant" on tenants;

drop policy if exists "Platform admins manage memberships" on tenant_memberships;
drop policy if exists "Tenant owners manage memberships" on tenant_memberships;
drop policy if exists "Users can view own memberships" on tenant_memberships;

create policy "Platform admins can view tenants" on tenants
  for select using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
  );

create policy "Tenant owners/admins can manage tenant" on tenants
  for all using (
    tenants.owner_id = auth.uid()
  ) with check (
    tenants.owner_id = auth.uid()
  );

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
