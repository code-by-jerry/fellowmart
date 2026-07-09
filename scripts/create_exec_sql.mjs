import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

const sql = `create or replace function public.exec_sql(sql text)
returns jsonb
language plpgsql
as $$
begin
  execute sql;
  return jsonb_build_object('ok', true);
end;
$$;`;

const { data, error } = await supabase.rpc("exec_sql", { sql });
console.log({ data, error });
