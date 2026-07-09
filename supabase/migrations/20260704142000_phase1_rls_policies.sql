-- Enable Row Level Security and create tenant-aware policies

-- Tenants
alter table tenants enable row level security;
create policy "Public can view active tenants" on tenants for select using (is_active = true);
create policy "Platform admins can view tenants" on tenants for select using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);
create policy "Tenant owners/admins can manage tenant" on tenants for all using (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = tenants.id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
) with check (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = tenants.id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);

-- Tenant memberships
alter table tenant_memberships enable row level security;
create policy "Platform admins manage memberships" on tenant_memberships for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
) with check (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);
create policy "Tenant owners manage memberships" on tenant_memberships for all using (
  exists (select 1 from tenant_memberships tm2 where tm2.tenant_id = tenant_memberships.tenant_id and tm2.user_id = auth.uid() and tm2.role = 'owner')
) with check (
  exists (select 1 from tenant_memberships tm2 where tm2.tenant_id = tenant_memberships.tenant_id and tm2.user_id = auth.uid() and tm2.role = 'owner')
);

-- Subscriptions
alter table subscriptions enable row level security;
create policy "Platform admins manage subscriptions" on subscriptions for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
) with check (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);
create policy "Tenant admins can view subscriptions" on subscriptions for select using (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = subscriptions.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);

-- Categories & Collections (public view, tenant management)
alter table categories enable row level security;
create policy "Public view categories" on categories for select using (is_active = true);
create policy "Tenant admins manage categories" on categories for all using (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = categories.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
) with check (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = categories.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);

alter table collections enable row level security;
create policy "Public view collections" on collections for select using (is_active = true);
create policy "Tenant admins manage collections" on collections for all using (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = collections.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
) with check (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = collections.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);

-- Products & Variants & Specs
alter table products enable row level security;
create policy "Public view active products" on products for select using (is_active = true);
create policy "Tenant admins manage products" on products for all using (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = products.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
) with check (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = products.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);

alter table product_variants enable row level security;
create policy "Public view variant parent product active" on product_variants for select using (
  exists (select 1 from products p where p.id = product_variants.product_id and p.is_active = true)
);
create policy "Tenant admins manage variants" on product_variants for all using (
  exists (select 1 from products p join tenant_memberships tm on tm.tenant_id = p.tenant_id where p.id = product_variants.product_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
) with check (
  exists (select 1 from products p join tenant_memberships tm on tm.tenant_id = p.tenant_id where p.id = product_variants.product_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);

alter table product_specs enable row level security;
create policy "Tenant admins manage specs" on product_specs for all using (
  exists (select 1 from products p join tenant_memberships tm on tm.tenant_id = p.tenant_id where p.id = product_specs.product_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
) with check (
  exists (select 1 from products p join tenant_memberships tm on tm.tenant_id = p.tenant_id where p.id = product_specs.product_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);

-- Product collections and images
alter table product_collections enable row level security;
create policy "Tenant admins manage product_collections" on product_collections for all using (
  exists (select 1 from products p join tenant_memberships tm on tm.tenant_id = p.tenant_id where p.id = product_collections.product_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
) with check (
  exists (select 1 from products p join tenant_memberships tm on tm.tenant_id = p.tenant_id where p.id = product_collections.product_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);

alter table product_images enable row level security;
create policy "Public view images" on product_images for select using (true);
create policy "Tenant admins manage images" on product_images for all using (
  exists (select 1 from products p join tenant_memberships tm on tm.tenant_id = p.tenant_id where p.id = product_images.product_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
) with check (
  exists (select 1 from products p join tenant_memberships tm on tm.tenant_id = p.tenant_id where p.id = product_images.product_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);

-- Carts & Cart items
alter table carts enable row level security;
create policy "Users can manage own carts" on carts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Tenant admins can view carts" on carts for select using (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = carts.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);

alter table cart_items enable row level security;
create policy "Users can manage own cart items" on cart_items for all using (
  exists (select 1 from carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
);

-- Wishlists & Wishlist items
alter table wishlists enable row level security;
create policy "Users can manage own wishlist" on wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Tenant admins can view wishlists" on wishlists for select using (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = wishlists.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);

alter table wishlist_items enable row level security;
create policy "Users can view wishlist items for their wishlist" on wishlist_items for select using (
  exists (select 1 from wishlists w where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid())
);
create policy "Users can modify wishlist items for their wishlist" on wishlist_items for all using (
  exists (select 1 from wishlists w where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid())
) with check (
  exists (select 1 from wishlists w where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid())
);

-- Orders & Order items
alter table orders enable row level security;
create policy "Public can create orders (guest checkout)" on orders for insert with check (true);
create policy "Tenant admins can view orders" on orders for select using (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = orders.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'user_id') then
    execute 'CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (user_id = auth.uid())';
  end if;
end
$$ language plpgsql;
create policy "Tenant admins can update orders" on orders for update using (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = orders.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
) with check (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = orders.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);

alter table order_items enable row level security;
create policy "Tenant admins can view order items" on order_items for select using (
  exists (select 1 from orders o join tenant_memberships tm on tm.tenant_id = o.tenant_id where o.id = order_items.order_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);
create policy "Public can insert order items" on order_items for insert with check (true);

-- Transactions
alter table transactions enable row level security;
create policy "Tenant admins can view transactions" on transactions for select using (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = transactions.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);
create policy "Platform admins can view all transactions" on transactions for select using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Tenant catalog settings
alter table tenant_catalog_settings enable row level security;
create policy "Tenant admins manage catalog settings" on tenant_catalog_settings for all using (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = tenant_catalog_settings.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
) with check (
  exists (select 1 from tenant_memberships tm where tm.tenant_id = tenant_catalog_settings.tenant_id and tm.user_id = auth.uid() and tm.role in ('owner','admin'))
);

-- Provide a default "allow" for public selects where appropriate (already added above)

-- End of RLS policies
