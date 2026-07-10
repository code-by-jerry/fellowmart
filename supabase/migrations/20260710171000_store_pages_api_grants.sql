-- Ensure store_pages is exposed to PostgREST (API roles + schema cache reload)

grant select on public.store_pages to anon, authenticated;
grant insert, update, delete on public.store_pages to authenticated;

notify pgrst, 'reload schema';
