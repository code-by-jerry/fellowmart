alter table site_settings
  add column if not exists announcement_text text not null default 'Free shipping on orders above $49.',
  add column if not exists announcement_promo text not null default 'Get 10% off your first order. Use code: WELCOME10',
  add column if not exists footer_description text not null default 'Your one-stop destination for premium products across all categories.',
  add column if not exists home_hero_eyebrow text not null default 'New Collection',
  add column if not exists home_hero_title text not null default 'Elevate Your Everyday',
  add column if not exists home_hero_description text not null default 'Discover premium products that combine style, quality and value.';
