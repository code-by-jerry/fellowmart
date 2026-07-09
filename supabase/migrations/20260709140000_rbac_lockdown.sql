-- RBAC lockdown: all signups are customers; admin role is assigned only via service role.

alter table profiles
  drop constraint if exists profiles_role_check;

alter table profiles
  add constraint profiles_role_check
  check (role in ('admin', 'customer'));

-- Never trust client-supplied role metadata on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    'customer',
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    )
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(profiles.full_name, excluded.full_name),
    updated_at = now();

  return new;
end;
$$;

-- Block users from promoting themselves to admin
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if auth.uid() is not null and auth.uid() = old.id then
      raise exception 'You cannot change your own role.';
    end if;

    if new.role = 'admin' and auth.role() <> 'service_role' then
      raise exception 'Admin role can only be assigned by the platform.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_profile_role on profiles;
create trigger trg_protect_profile_role
  before update on profiles
  for each row
  execute function public.protect_profile_role();

-- Demote any stray admin accounts; only the platform admin email may hold admin role
update public.profiles
set role = 'customer', updated_at = now()
where role = 'admin'
  and lower(trim(email)) <> lower(trim('contact@codebyjerry.online'));
