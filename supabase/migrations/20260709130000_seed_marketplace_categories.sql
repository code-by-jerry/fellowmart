-- Display metadata for storefront category cards
alter table categories
  add column if not exists icon_name text,
  add column if not exists product_count_text text;

alter table site_settings
  add column if not exists marketplace_tenant_slug text not null default 'fellowmart';

-- Ensure the platform marketplace tenant exists
insert into tenants (name, slug, is_active)
select 'FellowMart Marketplace', 'fellowmart', true
where not exists (
  select 1 from tenants where slug = 'fellowmart'
);

-- Seed default marketplace categories
insert into categories (
  tenant_id,
  name,
  slug,
  product_count_text,
  icon_name,
  sort_order,
  is_active
)
select
  tenant.id,
  seed.name,
  seed.slug,
  seed.product_count_text,
  seed.icon_name,
  seed.sort_order,
  true
from tenants tenant
cross join (
  values
    ('Electronics', 'electronics', '1200+ Products', 'Smartphone', 1),
    ('Fashion', 'fashion', '2500+ Products', 'Shirt', 2),
    ('Home & Living', 'home-living', '1800+ Products', 'Armchair', 3),
    ('Beauty & Care', 'beauty-care', '950+ Products', 'SprayCan', 4),
    ('Kitchen', 'kitchen', '1100+ Products', 'CookingPot', 5),
    ('Grocery', 'grocery', '3000+ Products', 'ShoppingBasket', 6),
    ('Sports & Outdoors', 'sports-outdoors', '700+ Products', 'Dumbbell', 7),
    ('Baby & Kids', 'baby-kids', '850+ Products', 'Baby', 8),
    ('Books & Stationery', 'books-stationery', '650+ Products', 'BookOpen', 9),
    ('Automotive', 'automotive', '500+ Products', 'Car', 10)
) as seed(name, slug, product_count_text, icon_name, sort_order)
where tenant.slug = 'fellowmart'
on conflict (tenant_id, slug) do update
set
  name = excluded.name,
  product_count_text = excluded.product_count_text,
  icon_name = excluded.icon_name,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();
