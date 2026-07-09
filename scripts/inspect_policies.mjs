import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await supabase.rpc("exec_sql", {
  sql: "select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check from pg_policies where tablename = 'tenant_memberships';",
});
console.log(error || data);
