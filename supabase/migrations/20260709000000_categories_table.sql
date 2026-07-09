-- Create categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  product_count_text text,
  icon_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table categories enable row level security;
create policy "Public can view categories" on categories for select using (true);
create policy "Admins can manage categories" on categories for all using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- Insert seed data
insert into categories (name, slug, product_count_text, icon_name) values
  ('Electronics', 'electronics', '1200+ Products', 'Smartphone'),
  ('Fashion', 'fashion', '2500+ Products', 'Shirt'),
  ('Home & Living', 'home-living', '1800+ Products', 'Armchair'),
  ('Beauty & Care', 'beauty-care', '950+ Products', 'SprayCan'),
  ('Kitchen', 'kitchen', '1100+ Products', 'CookingPot'),
  ('Grocery', 'grocery', '3000+ Products', 'ShoppingBasket'),
  ('Sports & Outdoors', 'sports-outdoors', '700+ Products', 'Dumbbell'),
  ('Baby & Kids', 'baby-kids', '850+ Products', 'Baby'),
  ('Books & Stationery', 'books-stationery', '650+ Products', 'Book'),
  ('Automotive', 'automotive', '500+ Products', 'Car');
