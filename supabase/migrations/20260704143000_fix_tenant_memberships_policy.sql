-- Fix: allow select on tenant_memberships to avoid recursive policy checks

alter table tenant_memberships enable row level security;

-- Allow read access for policy checks (tighten later if needed)
create policy "Allow read for tenant membership checks" on tenant_memberships for select using (true);
