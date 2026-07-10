-- Order fulfillment tracking + customer access to order line items.

alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists tracking_carrier text;
alter table orders add column if not exists shipped_at timestamptz;
alter table orders add column if not exists delivered_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'order_items'
      and policyname = 'Users can view own order items'
  ) then
    create policy "Users can view own order items" on order_items
      for select using (
        exists (
          select 1 from orders o
          where o.id = order_items.order_id
            and o.user_id = auth.uid()
        )
      );
  end if;
end $$;
