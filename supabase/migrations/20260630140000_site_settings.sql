-- Add site_settings table for global app configuration
create table site_settings (
  id integer primary key default 1 check (id = 1), -- singleton row
  app_name text not null default 'fellowmate',
  logo_url text,
  logo_alt text not null default 'fellowmate logo',
  favicon_url text,
  theme_color text not null default '#000000',
  meta_title text not null default 'fellowmate — Commerce for Local Businesses',
  meta_description text not null default 'Discover and order from local stores near you. fellowmate makes local commerce simple.',
  meta_keywords text not null default 'local store, ecommerce, fellowmate',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed one default row
insert into site_settings (id) values (1) on conflict do nothing;

-- RLS: only admins can update; anyone can read
alter table site_settings enable row level security;
create policy "Public can read site settings" on site_settings for select using (true);
create policy "Admins can update site settings" on site_settings for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
