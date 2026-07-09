import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SR = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SR) {
  throw new Error("Missing SUPABASE env vars");
}
console.log("url=", JSON.stringify(URL));
console.log("len=", URL.length);
const client = createClient(URL, SR);
for (const table of [
  "orders",
  "carts",
  "cart_items",
  "order_items",
  "wishlists",
  "wishlist_items",
]) {
  const { data, error } = await client
    .from("columns")
    .schema("information_schema")
    .select("column_name,data_type,is_nullable")
    .eq("table_name", table)
    .order("ordinal_position", { ascending: true });
  console.log(`TABLE ${table}`);
  if (error) {
    console.error(error);
    continue;
  }
  console.log(JSON.stringify(data, null, 2));
}
