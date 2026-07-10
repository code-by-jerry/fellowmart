-- Enterprise product catalog: extended fields, options, attributes, custom field definitions

-- ─── Products: enterprise columns ───────────────────────────────────────────
alter table products add column if not exists brand text;
alter table products add column if not exists subtitle text;
alter table products add column if not exists status text not null default 'draft';
alter table products add column if not exists compare_at_price numeric(12,2);
alter table products add column if not exists barcode text;
alter table products add column if not exists mpn text;
alter table products add column if not exists gtin text;
alter table products add column if not exists hs_code text;
alter table products add column if not exists has_variants boolean not null default false;
alter table products add column if not exists track_inventory boolean not null default true;
alter table products add column if not exists stock_quantity integer not null default 0;
alter table products add column if not exists low_stock_threshold integer not null default 5;
alter table products add column if not exists allow_backorder boolean not null default false;
alter table products add column if not exists stock_status text not null default 'in_stock';
alter table products add column if not exists tax_class text not null default 'standard';
alter table products add column if not exists taxable boolean not null default true;
alter table products add column if not exists weight numeric(12,3);
alter table products add column if not exists weight_unit text not null default 'kg';
alter table products add column if not exists length numeric(12,2);
alter table products add column if not exists width numeric(12,2);
alter table products add column if not exists height numeric(12,2);
alter table products add column if not exists dimension_unit text not null default 'cm';
alter table products add column if not exists requires_shipping boolean not null default true;
alter table products add column if not exists shipping_class text;
alter table products add column if not exists is_featured boolean not null default false;
alter table products add column if not exists featured_image_url text;
alter table products add column if not exists meta_keywords text[] not null default '{}';
alter table products add column if not exists tags text[] not null default '{}';
alter table products add column if not exists custom_fields jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_status_check'
  ) then
    alter table products add constraint products_status_check
      check (status in ('draft', 'active', 'archived'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'products_stock_status_check'
  ) then
    alter table products add constraint products_stock_status_check
      check (stock_status in ('in_stock', 'out_of_stock', 'low_stock', 'backorder'));
  end if;
end $$;

create unique index if not exists idx_products_tenant_slug_unique
  on products(tenant_id, slug);

create unique index if not exists idx_products_tenant_barcode_unique
  on products(tenant_id, barcode)
  where barcode is not null and barcode <> '';

-- ─── Product variants: enterprise columns ───────────────────────────────────
alter table product_variants add column if not exists compare_at_price numeric(12,2);
alter table product_variants add column if not exists cost_price numeric(12,2);
alter table product_variants add column if not exists barcode text;
alter table product_variants add column if not exists weight numeric(12,3);
alter table product_variants add column if not exists weight_unit text not null default 'kg';
alter table product_variants add column if not exists image_url text;
alter table product_variants add column if not exists position integer not null default 0;
alter table product_variants add column if not exists low_stock_threshold integer not null default 5;
alter table product_variants add column if not exists allow_backorder boolean not null default false;
alter table product_variants add column if not exists stock_status text not null default 'in_stock';
alter table product_variants add column if not exists custom_fields jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'product_variants_stock_status_check'
  ) then
    alter table product_variants add constraint product_variants_stock_status_check
      check (stock_status in ('in_stock', 'out_of_stock', 'low_stock', 'backorder'));
  end if;
end $$;

-- ─── Variant option axes (Color, Size, …) ───────────────────────────────────
create table if not exists product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique(product_id, name)
);

create table if not exists product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references product_options(id) on delete cascade,
  value text not null,
  position integer not null default 0,
  swatch_color text,
  swatch_image_url text,
  created_at timestamptz not null default now(),
  unique(option_id, value)
);

-- ─── Structured specifications (Display, Processor, …) ──────────────────────
create table if not exists product_attributes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  group_name text not null default 'Specifications',
  attribute_key text not null,
  attribute_value text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_attributes_product
  on product_attributes(product_id, sort_order);

-- ─── Tenant custom field definitions ────────────────────────────────────────
create table if not exists product_field_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  field_key text not null,
  label text not null,
  field_type text not null default 'text',
  field_group text not null default 'Custom',
  description text,
  options jsonb not null default '[]'::jsonb,
  is_required boolean not null default false,
  applies_to text not null default 'product',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(tenant_id, field_key),
  check (field_type in ('text', 'textarea', 'number', 'boolean', 'select', 'multi_select', 'url', 'date', 'color')),
  check (applies_to in ('product', 'variant', 'both'))
);

create index if not exists idx_product_field_definitions_tenant
  on product_field_definitions(tenant_id, sort_order);

-- ─── Custom field values (normalized) ───────────────────────────────────────
create table if not exists product_custom_values (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  field_definition_id uuid not null references product_field_definitions(id) on delete cascade,
  value jsonb not null default 'null'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, field_definition_id)
);

create table if not exists product_variant_custom_values (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete cascade,
  field_definition_id uuid not null references product_field_definitions(id) on delete cascade,
  value jsonb not null default 'null'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(variant_id, field_definition_id)
);

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table product_options enable row level security;
alter table product_option_values enable row level security;
alter table product_attributes enable row level security;
alter table product_field_definitions enable row level security;
alter table product_custom_values enable row level security;
alter table product_variant_custom_values enable row level security;

create policy "Public view product options" on product_options for select using (
  exists (select 1 from products p where p.id = product_options.product_id and p.is_active = true)
);
create policy "Tenant managers manage product options" on product_options for all using (
  exists (
    select 1 from products p
    join tenant_memberships tm on tm.tenant_id = p.tenant_id
    where p.id = product_options.product_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from products p
    join tenant_memberships tm on tm.tenant_id = p.tenant_id
    where p.id = product_options.product_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

create policy "Public view option values" on product_option_values for select using (
  exists (
    select 1 from product_options po
    join products p on p.id = po.product_id
    where po.id = product_option_values.option_id and p.is_active = true
  )
);
create policy "Tenant managers manage option values" on product_option_values for all using (
  exists (
    select 1 from product_options po
    join products p on p.id = po.product_id
    join tenant_memberships tm on tm.tenant_id = p.tenant_id
    where po.id = product_option_values.option_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from product_options po
    join products p on p.id = po.product_id
    join tenant_memberships tm on tm.tenant_id = p.tenant_id
    where po.id = product_option_values.option_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

create policy "Public view product attributes" on product_attributes for select using (
  exists (select 1 from products p where p.id = product_attributes.product_id and p.is_active = true)
);
create policy "Tenant managers manage product attributes" on product_attributes for all using (
  exists (
    select 1 from products p
    join tenant_memberships tm on tm.tenant_id = p.tenant_id
    where p.id = product_attributes.product_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from products p
    join tenant_memberships tm on tm.tenant_id = p.tenant_id
    where p.id = product_attributes.product_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

create policy "Tenant members view field definitions" on product_field_definitions for select using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = product_field_definitions.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);
create policy "Tenant managers manage field definitions" on product_field_definitions for all using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = product_field_definitions.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = product_field_definitions.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

create policy "Tenant managers manage product custom values" on product_custom_values for all using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = product_custom_values.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = product_custom_values.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

create policy "Tenant managers manage variant custom values" on product_variant_custom_values for all using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = product_variant_custom_values.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = product_variant_custom_values.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

-- Extend product_variants RLS to include staff
drop policy if exists "Tenant admins manage variants" on product_variants;
create policy "Tenant managers manage variants" on product_variants for all using (
  exists (
    select 1 from products p
    join tenant_memberships tm on tm.tenant_id = p.tenant_id
    where p.id = product_variants.product_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from products p
    join tenant_memberships tm on tm.tenant_id = p.tenant_id
    where p.id = product_variants.product_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);

drop policy if exists "Tenant admins manage products" on products;
create policy "Tenant managers manage products" on products for all using (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = products.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
) with check (
  exists (
    select 1 from tenant_memberships tm
    where tm.tenant_id = products.tenant_id
      and tm.user_id = auth.uid()
      and tm.role in ('owner', 'admin', 'staff')
  )
);
