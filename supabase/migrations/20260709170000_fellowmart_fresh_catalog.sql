-- Fellowmart platform demo store: mark tenant + reset catalog shell
-- Full product seed: npm run seed:fellowmart

alter table tenants
  add column if not exists is_platform_store boolean not null default false;

update tenants
set
  name = 'FellowMart',
  is_active = true,
  is_platform_store = true,
  onboarding_status = coalesce(onboarding_status, 'active'),
  business_type = coalesce(business_type, 'general'),
  settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object(
    'is_platform_store', true,
    'home_hero_eyebrow', 'New Collection',
    'home_hero_title', 'Elevate Your Everyday',
    'home_hero_description', 'Discover premium products that combine style, quality and value.'
  ),
  updated_at = now()
where slug = 'fellowmart';

insert into tenants (name, slug, is_active, is_platform_store, onboarding_status, business_type, settings)
select
  'FellowMart',
  'fellowmart',
  true,
  true,
  'active',
  'general',
  jsonb_build_object(
    'is_platform_store', true,
    'home_hero_eyebrow', 'New Collection',
    'home_hero_title', 'Elevate Your Everyday',
    'home_hero_description', 'Discover premium products that combine style, quality and value.'
  )
where not exists (select 1 from tenants where slug = 'fellowmart');

-- Clear existing fellowmart catalog (fresh start)
do $$
declare
  fm_id uuid;
begin
  select id into fm_id from tenants where slug = 'fellowmart' limit 1;
  if fm_id is null then
    return;
  end if;

  delete from products where tenant_id = fm_id;
  delete from collections where tenant_id = fm_id;
  delete from categories where tenant_id = fm_id;
end $$;

-- Categories
insert into categories (
  tenant_id, name, slug, description, product_count_text, icon_name, sort_order, is_active
)
select
  t.id,
  c.name,
  c.slug,
  c.description,
  c.product_count_text,
  c.icon_name,
  c.sort_order,
  true
from tenants t
cross join (
  values
    ('Electronics', 'electronics', 'Phones, laptops, audio and smart devices', '1200+ Products', 'Smartphone', 1),
    ('Fashion', 'fashion', 'Clothing, footwear and accessories', '2500+ Products', 'Shirt', 2),
    ('Home & Living', 'home-living', 'Furniture, decor and everyday essentials', '1800+ Products', 'Armchair', 3),
    ('Beauty & Care', 'beauty-care', 'Skincare, grooming and wellness', '950+ Products', 'SprayCan', 4),
    ('Kitchen', 'kitchen', 'Cookware, appliances and dining', '1100+ Products', 'CookingPot', 5),
    ('Grocery', 'grocery', 'Fresh staples and pantry favorites', '3000+ Products', 'ShoppingBasket', 6),
    ('Sports & Outdoors', 'sports-outdoors', 'Fitness gear and outdoor equipment', '700+ Products', 'Dumbbell', 7),
    ('Baby & Kids', 'baby-kids', 'Toys, clothing and nursery', '850+ Products', 'Baby', 8),
    ('Books & Stationery', 'books-stationery', 'Books, office and art supplies', '650+ Products', 'BookOpen', 9),
    ('Automotive', 'automotive', 'Car care and accessories', '500+ Products', 'Car', 10)
) as c(name, slug, description, product_count_text, icon_name, sort_order)
where t.slug = 'fellowmart';

-- Collections (homepage "Shop by Collection")
insert into collections (tenant_id, name, slug, description, sort_order, is_active)
select
  t.id,
  c.name,
  c.slug,
  c.description,
  c.sort_order,
  true
from tenants t
cross join (
  values
    ('Home & Living', 'home-living', '120+ items for every room', 1),
    ('Accessories', 'accessories', '90+ style essentials', 2),
    ('Beauty & Care', 'beauty-care', '150+ self-care picks', 3),
    ('Footwear', 'footwear', '200+ shoes and sneakers', 4),
    ('Electronics', 'electronics', '300+ gadgets and gear', 5),
    ('Kitchen', 'kitchen', '180+ cooking must-haves', 6)
) as c(name, slug, description, sort_order)
where t.slug = 'fellowmart';
