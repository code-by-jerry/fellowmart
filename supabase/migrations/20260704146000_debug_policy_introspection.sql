create or replace function public.exec_sql(sql text)
returns jsonb
language plpgsql
as $$
begin
  execute sql;
  return jsonb_build_object('ok', true);
end;
$$;