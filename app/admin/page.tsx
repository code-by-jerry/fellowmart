import { redirect } from "next/navigation";
import { isPlatformAdminProfile } from "@/lib/auth/platform-admin";
import { createAdminClient } from "@/utils/supabase/admin-server";

export default async function AdminPage() {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (isPlatformAdminProfile(profile)) {
    redirect("/admin/dashboard");
  }

  redirect("/admin/login?error=Access denied. Admin accounts only.");
}
