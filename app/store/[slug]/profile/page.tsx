import Link from "next/link";
import { redirect } from "next/navigation";
import { TenantStoreLayout } from "@/components/storefront/TenantStoreLayout";
import { ProfileDetailsForm } from "@/components/storefront/ProfileDetailsForm";
import { AddressManager } from "@/components/storefront/AddressManager";
import { createClient } from "@/utils/supabase/server";
import type { CustomerAddress, CustomerProfile } from "@/lib/types/customer";
import { Calendar, Package, ShieldCheck, UserRound } from "lucide-react";
import { storeOrdersPath } from "@/lib/storefront/store-links";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import { storePath } from "@/lib/routes/store-routes";

function getDisplayName(
  profile: Pick<CustomerProfile, "full_name"> | null,
  user: { email?: string | null; user_metadata?: Record<string, unknown> },
) {
  if (profile?.full_name?.trim()) {
    return profile.full_name.trim();
  }

  const metadataName =
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name);

  if (metadataName) {
    return metadataName;
  }

  return user.email?.split("@")[0] ?? "User";
}

export default async function StoreProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeTenantSlug(rawSlug);

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/login?next=${encodeURIComponent(storePath(slug, "profile"))}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, phone, marketing_opt_in, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const { data: addresses } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  const displayName = getDisplayName(profile, user);
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  const profileData: Pick<
    CustomerProfile,
    "full_name" | "phone" | "marketing_opt_in"
  > = {
    full_name: profile?.full_name ?? null,
    phone: profile?.phone ?? null,
    marketing_opt_in: profile?.marketing_opt_in ?? false,
  };

  return (
    <TenantStoreLayout slug={slug} userName={displayName} showCategoryNav={false}>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Profile
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your account details and saved delivery addresses.
          </p>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="border-b border-gray-100 px-6 py-8 sm:px-10">
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <UserRound className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {displayName}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Member since
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                      {joinDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-gray-200">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Account role
                    </p>
                    <p className="mt-0.5 text-sm font-semibold capitalize text-gray-900">
                      {profile?.role ?? "Customer"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-10">
              <h2 className="mb-1 text-lg font-semibold text-gray-900">
                Personal details
              </h2>
              <p className="mb-6 text-sm text-gray-500">
                Used for orders, delivery updates, and marketing preferences.
              </p>
              <ProfileDetailsForm
                profile={profileData}
                email={user.email ?? ""}
              />
            </div>

            <div className="border-t border-gray-100 px-6 py-4 flex justify-end bg-gray-50">
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

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
                <p className="mt-1 text-sm text-gray-500">
                  View order history and payment status.
                </p>
              </div>
              <Link
                href={storeOrdersPath(slug)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                <Package className="h-4 w-4" />
                My orders
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-10">
            <AddressManager
              addresses={(addresses ?? []) as CustomerAddress[]}
              profileDefaults={{
                full_name: profileData.full_name,
                phone: profileData.phone,
              }}
            />
          </div>
        </div>
      </div>
    </TenantStoreLayout>
  );
}
