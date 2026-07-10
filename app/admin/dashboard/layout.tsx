import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { AdminLayoutProvider } from "@/components/admin/AdminLayoutProvider";
import { isPlatformAdminProfile } from "@/lib/auth/platform-admin";
import { createAdminClient } from "@/utils/supabase/admin-server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (!isPlatformAdminProfile(profile)) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=Access denied. Admin accounts only.");
  }

  return (
    <AdminLayoutProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#f1f1f1]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1200px] p-3 sm:p-4">{children}</div>
          </main>
        </div>
      </div>
    </AdminLayoutProvider>
  );
}
