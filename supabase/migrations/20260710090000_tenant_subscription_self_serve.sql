-- Allow tenant owners/admins to self-serve update their own subscription plan

drop policy if exists "Tenant managers update own subscription" on subscriptions;
create policy "Tenant managers update own subscription" on subscriptions
  for update using (
    exists (
      select 1 from tenant_memberships tm
      where tm.tenant_id = subscriptions.tenant_id
        and tm.user_id = auth.uid()
        and tm.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1 from tenant_memberships tm
      where tm.tenant_id = subscriptions.tenant_id
        and tm.user_id = auth.uid()
        and tm.role in ('owner', 'admin')
    )
  );

drop policy if exists "Tenant managers insert own subscription" on subscriptions;
create policy "Tenant managers insert own subscription" on subscriptions
  for insert with check (
    exists (
      select 1 from tenant_memberships tm
      where tm.tenant_id = subscriptions.tenant_id
        and tm.user_id = auth.uid()
        and tm.role in ('owner', 'admin')
    )
  );
