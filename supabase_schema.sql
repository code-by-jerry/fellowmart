-- Create profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'customer' not null, -- 'admin' or 'customer'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create stores table
create table stores (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
create table products (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric(10, 2) not null default 0.00,
  stock_count integer not null default 0,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  store_id uuid references stores(id) on delete cascade not null,
  customer_name text not null,
  customer_contact text not null, -- email or phone
  status text not null default 'pending', -- pending, paid, shipped, delivered, cancelled
  total_amount numeric(10, 2) not null default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order items table
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete restrict not null,
  quantity integer not null default 1,
  price numeric(10, 2) not null, -- snapshot of product price at time of order
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)

-- 1. Profiles
alter table profiles enable row level security;
create policy "Users can view own profile." on profiles for select using (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Trigger to create a profile automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id, 
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Stores
alter table stores enable row level security;
create policy "Public can view stores" on stores for select using (true);
create policy "Owners can insert their own stores." on stores for insert with check (auth.uid() = owner_id);
create policy "Owners can update their own stores." on stores for update using (auth.uid() = owner_id);
create policy "Owners can delete their own stores." on stores for delete using (auth.uid() = owner_id);

-- 3. Products
alter table products enable row level security;
create policy "Public can view products." on products for select using (true);
create policy "Store owners can manage products." on products for all using (
  exists (select 1 from stores where stores.id = products.store_id and stores.owner_id = auth.uid())
);

-- 4. Orders
alter table orders enable row level security;
create policy "Store owners can view their orders." on orders for select using (
  exists (select 1 from stores where stores.id = orders.store_id and stores.owner_id = auth.uid())
);
create policy "Store owners can update their orders." on orders for update using (
  exists (select 1 from stores where stores.id = orders.store_id and stores.owner_id = auth.uid())
);
create policy "Public can insert orders." on orders for insert with check (true);

-- 5. Order Items
alter table order_items enable row level security;
create policy "Store owners can view their order items." on order_items for select using (
  exists (
    select 1 from orders
    join stores on stores.id = orders.store_id
    where orders.id = order_items.order_id and stores.owner_id = auth.uid()
  )
);
create policy "Store owners can update their order items." on order_items for update using (
  exists (
    select 1 from orders
    join stores on stores.id = orders.store_id
    where orders.id = order_items.order_id and stores.owner_id = auth.uid()
  )
);
create policy "Public can insert order items." on order_items for insert with check (true);

-- Set up Storage for product images
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;
create policy "Public Access" on storage.objects for select using (bucket_id = 'product-images');
create policy "Auth Insert" on storage.objects for insert with check (auth.role() = 'authenticated' and bucket_id = 'product-images');
create policy "Auth Update" on storage.objects for update using (auth.role() = 'authenticated' and bucket_id = 'product-images');
create policy "Auth Delete" on storage.objects for delete using (auth.role() = 'authenticated' and bucket_id = 'product-images');
