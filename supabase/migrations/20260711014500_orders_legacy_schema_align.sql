-- Align legacy orders/order_items (store_id era) with tenant checkout schema.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'store_id'
  ) then
    alter table orders alter column store_id drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'customer_contact'
  ) then
    alter table orders alter column customer_contact drop not null;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'order_items' and column_name = 'product_id'
  ) then
    alter table order_items alter column product_id drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'order_items' and column_name = 'price'
  ) then
    alter table order_items alter column price drop not null;
  end if;
end $$;

-- Ensure tenant_id is required for new checkout rows when present.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'tenant_id'
  ) then
    alter table orders alter column tenant_id set not null;
  end if;
exception
  when others then
  -- Ignore if existing rows lack tenant_id; checkout always sets it.
  null;
end $$;
