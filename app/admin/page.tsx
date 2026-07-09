import { redirect } from "next/navigation";
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
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    redirect("/admin/dashboard");
  }

  redirect("/admin/login?error=Access denied. Admin accounts only.");
}
