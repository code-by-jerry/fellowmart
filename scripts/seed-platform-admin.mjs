import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (
  process.env.PLATFORM_ADMIN_EMAIL ?? "contact@codebyjerry.online"
).trim();
const password = process.env.PLATFORM_ADMIN_PASSWORD;

if (!URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
}

if (!password) {
  throw new Error(
    "Set PLATFORM_ADMIN_PASSWORD in .env.local before running this script.",
  );
}

const admin = createClient(URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === targetEmail.toLowerCase(),
    );
    if (match) return match;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function main() {
  const normalizedEmail = email.toLowerCase();
  let user = await findUserByEmail(normalizedEmail);

  if (user) {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    console.log(`Updated password for existing user: ${normalizedEmail}`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
    console.log(`Created platform admin user: ${normalizedEmail}`);
  }

  const { error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: normalizedEmail,
        role: "admin",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

  if (profileError) throw profileError;

  const { error: demoteError } = await admin
    .from("profiles")
    .update({ role: "customer", updated_at: new Date().toISOString() })
    .eq("role", "admin")
    .neq("id", user.id);

  if (demoteError) throw demoteError;

  console.log("Platform admin profile role set. Other admin accounts demoted.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
