import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminAddressManager } from "@/components/admin/AdminAddressManager";
import { AdminCustomerProfileForm } from "@/components/admin/AdminCustomerProfileForm";
import {
  AdminFormCard,
  AdminPage,
  AdminPageHeader,
} from "@/components/admin/admin-ui";
import { getAdminDataClient } from "@/lib/admin/auth";
import type { CustomerAddress, CustomerProfile } from "@/lib/types/customer";

type CustomerDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function CustomerDetailPage({
  params,
  searchParams,
}: CustomerDetailPageProps) {
  const { id } = await params;
  const { success, error } = await searchParams;
  const db = await getAdminDataClient();

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("id, email, full_name, phone, marketing_opt_in, role, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "customer") {
    notFound();
  }

  const { data: addresses } = await db
    .from("customer_addresses")
    .select("*")
    .eq("user_id", id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  const customerProfile = profile as CustomerProfile;

  return (
    <AdminPage>
      <Link
        href="/admin/dashboard/customers"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to customers
      </Link>

      <AdminPageHeader
        title={customerProfile.full_name ?? customerProfile.email ?? "Customer"}
        description={`${customerProfile.email} · Joined ${new Date(customerProfile.created_at).toLocaleDateString()}`}
      />

      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminFormCard title="Profile details" description="Contact information and preferences.">
          <AdminCustomerProfileForm profile={customerProfile} />
        </AdminFormCard>

        <AdminFormCard title="Delivery addresses" description="Saved addresses for checkout.">
          <AdminAddressManager
            userId={customerProfile.id}
            addresses={(addresses ?? []) as CustomerAddress[]}
            profileDefaults={{
              full_name: customerProfile.full_name,
              phone: customerProfile.phone,
            }}
          />
        </AdminFormCard>
      </div>
    </AdminPage>
  );
}
