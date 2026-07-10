-- Allow staff to manage categories and collections (aligned with products policy)

drop policy if exists "Tenant admins manage categories" on categories;
create policy "Tenant managers manage categories" on categories for all using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = categories.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = categories.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

drop policy if exists "Tenant admins manage collections" on collections;
create policy "Tenant managers manage collections" on collections for all using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = collections.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = collections.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

-- Tenant managers can view inactive categories/collections for their store
drop policy if exists "Tenant managers view all categories" on categories;
create policy "Tenant managers view all categories" on categories for select using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = categories.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

drop policy if exists "Tenant managers view all collections" on collections;
create policy "Tenant managers view all collections" on collections for select using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = collections.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

-- Tenant managers can view draft/archived products in business portal
drop policy if exists "Tenant managers view all products" on products;
create policy "Tenant managers view all products" on products for select using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = products.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);
