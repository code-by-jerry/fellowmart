-- Business onboarding: applications queue + tenant business metadata

alter table tenants
  add column if not exists business_type text not null default 'general',
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists address_line1 text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists postal_code text,
  add column if not exists country text not null default 'IN',
  add column if not exists business_description text,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references auth.users(id) on delete set null;

alter table tenants
  drop constraint if exists tenants_business_type_check;

alter table tenants
  add constraint tenants_business_type_check
  check (business_type in (
    'general',
    'grocery',
    'electronics',
    'footwear',
    'clothing',
    'textile',
    'pharmacy',
    'restaurant',
    'services'
  ));

create table if not exists business_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text not null,
  business_name text not null,
  business_slug text not null,
  business_type text not null default 'general'
    check (business_type in (
      'general',
      'grocery',
      'electronics',
      'footwear',
      'clothing',
      'textile',
      'pharmacy',
      'restaurant',
      'services'
    )),
  business_description text,
  address_line1 text,
  city text,
  state text,
  postal_code text,
  country text not null default 'IN',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  review_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  tenant_id uuid references tenants(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_business_applications_status
  on business_applications(status, created_at desc);

create index if not exists idx_business_applications_email
  on business_applications(applicant_email);

create unique index if not exists idx_business_applications_slug_pending
  on business_applications(business_slug)
  where status = 'pending';

alter table business_applications enable row level security;

drop policy if exists "Applicants can view own applications" on business_applications;
create policy "Applicants can view own applications"
  on business_applications for select
  using (
    user_id = auth.uid()
    or lower(applicant_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "Authenticated users can submit applications" on business_applications;
create policy "Authenticated users can submit applications"
  on business_applications for insert
  with check (
    auth.uid() is not null
    and status = 'pending'
    and (user_id is null or user_id = auth.uid())
  );

drop policy if exists "Platform admins manage applications" on business_applications;
create policy "Platform admins manage applications"
  on business_applications for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
