-- The tenant-scoped `categories` table is already created in phase0 foundation
-- (tenant_id, slug, description, etc.). An earlier draft of this migration
-- attempted a separate global categories table with homepage metadata columns,
-- which conflicts with the existing table on remote databases.
--
-- No schema changes required here; recorded so migration history stays in sync.

do $$
begin
  raise notice 'categories table already provisioned by phase0 foundation migration';
end $$;
