-- Fix infinite RLS recursion on tenants <-> tenant_memberships
-- Policies must not cross-query those tables under RLS; use a security definer helper.

create or replace function public.is_tenant_manager(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = p_tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin')
  );
$$;

revoke all on function public.is_tenant_manager(uuid) from public;
grant execute on function public.is_tenant_manager(uuid) to authenticated;

-- Replace recursive tenants update policy
drop policy if exists "Tenant managers update store branding" on tenants;
create policy "Tenant managers update store branding" on tenants
  for update using (
    public.is_tenant_manager(id)
  )
  with check (
    public.is_tenant_manager(id)
  );

-- Team request policies: same helper (avoid tenants <-> memberships recursion)
drop policy if exists "Managers read own team requests" on team_access_requests;
create policy "Managers read own team requests" on team_access_requests
  for select using (
    public.is_tenant_manager(tenant_id)
  );

drop policy if exists "Managers create team requests" on team_access_requests;
create policy "Managers create team requests" on team_access_requests
  for insert with check (
    requested_by = auth.uid()
    and public.is_tenant_manager(tenant_id)
  );

drop policy if exists "Managers cancel own team requests" on team_access_requests;
create policy "Managers cancel own team requests" on team_access_requests
  for update using (
    public.is_tenant_manager(tenant_id)
  )
  with check (
    public.is_tenant_manager(tenant_id)
  );
