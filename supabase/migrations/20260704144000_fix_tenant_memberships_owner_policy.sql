-- Replace recursive tenant_memberships owner policy to reference tenants.owner_id

alter table tenant_memberships enable row level security;

-- Drop the recursive policy if it exists
drop policy if exists "Tenant owners manage memberships" on tenant_memberships;

-- Create a new owner-based policy that checks the tenants.owner_id
create policy "Tenant owners manage memberships" on tenant_memberships for all using (
  exists (select 1 from tenants t where t.id = tenant_memberships.tenant_id and t.owner_id = auth.uid())
) with check (
  exists (select 1 from tenants t where t.id = tenant_memberships.tenant_id and t.owner_id = auth.uid())
);
