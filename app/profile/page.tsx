import { redirect } from "next/navigation";
import { CustomerStoreLayout } from "@/components/storefront/CustomerStoreLayout";
import { createClient } from "@/utils/supabase/server";
import { UserRound, Mail, Calendar, ShieldCheck } from "lucide-react";
import styles from "@/app/home.module.css";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const userName = user.email?.split("@")[0] ?? null;
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  return (
    <CustomerStoreLayout userName={userName} showPrimaryNav={true} showCategoryNav={false}>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Profile</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your account settings and view your details.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="px-6 py-8 sm:p-10">
            <div className="flex items-center gap-6">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="h-12 w-12" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {userName ?? "User"}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-gray-500">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Member Since</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900">{joinDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                  <ShieldCheck className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account Role</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-900 capitalize">
                    {profile?.role ?? "Customer"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end">
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </CustomerStoreLayout>
  );
}
