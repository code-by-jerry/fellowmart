-- Extend product_collections RLS to staff (aligned with products policy)

drop policy if exists "Tenant admins manage product_collections" on product_collections;
create policy "Tenant managers manage product_collections" on product_collections for all using (
  exists (
    select 1 from products p
    join tenant_memberships tm on tm.tenant_id = p.tenant_id
    where p.id = product_collections.product_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from products p
    join tenant_memberships tm on tm.tenant_id = p.tenant_id
    where p.id = product_collections.product_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);
