do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'categories' and column_name = 'tenant_id') then
    alter table categories add column tenant_id uuid;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'collections' and column_name = 'tenant_id') then
    alter table collections add column tenant_id uuid;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'tenant_id') then
    alter table products add column tenant_id uuid;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'product_variants' and column_name = 'product_id') then
    alter table product_variants add column product_id uuid;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'carts' and column_name = 'tenant_id') then
    alter table carts add column tenant_id uuid;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'tenant_id') then
    alter table orders add column tenant_id uuid;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'transactions' and column_name = 'tenant_id') then
    alter table transactions add column tenant_id uuid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'categories_tenant_id_fkey'
  ) then
    alter table categories
      add constraint categories_tenant_id_fkey
      foreign key (tenant_id) references tenants(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'collections_tenant_id_fkey'
  ) then
    alter table collections
      add constraint collections_tenant_id_fkey
      foreign key (tenant_id) references tenants(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'products_tenant_id_fkey'
  ) then
    alter table products
      add constraint products_tenant_id_fkey
      foreign key (tenant_id) references tenants(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'carts_tenant_id_fkey'
  ) then
    alter table carts
      add constraint carts_tenant_id_fkey
      foreign key (tenant_id) references tenants(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'orders_tenant_id_fkey'
  ) then
    alter table orders
      add constraint orders_tenant_id_fkey
      foreign key (tenant_id) references tenants(id) on delete cascade not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'transactions_tenant_id_fkey'
  ) then
    alter table transactions
      add constraint transactions_tenant_id_fkey
      foreign key (tenant_id) references tenants(id) on delete cascade not valid;
  end if;
end $$;

create index if not exists idx_categories_tenant on categories(tenant_id);
create index if not exists idx_collections_tenant on collections(tenant_id);
create index if not exists idx_products_tenant on products(tenant_id);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_slug on products(tenant_id, slug);
create index if not exists idx_product_variants_product on product_variants(product_id);
create index if not exists idx_carts_tenant on carts(tenant_id);
create index if not exists idx_orders_tenant on orders(tenant_id);
create index if not exists idx_transactions_order on transactions(order_id);
