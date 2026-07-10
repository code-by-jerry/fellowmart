import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SubscriptionPlanForm } from "@/components/admin/SubscriptionPlanForm";
import {
  AdminFormCard,
  AdminPage,
  AdminPageHeader,
} from "@/components/admin/admin-ui";
import { getAdminDataClient } from "@/lib/admin/auth";
import { getSubscriptionPlanById } from "@/lib/subscriptions/plans";

type EditSubscriptionPlanPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function EditSubscriptionPlanPage({
  params,
  searchParams,
}: EditSubscriptionPlanPageProps) {
  const { id } = await params;
  const { success, error } = await searchParams;
  const db = await getAdminDataClient();
  const plan = await getSubscriptionPlanById(db, id);

  if (!plan) {
    notFound();
  }

  return (
    <AdminPage>
      <Link
        href="/admin/dashboard/subscription-plans"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to plans
      </Link>

      <AdminPageHeader
        title={`Edit ${plan.name}`}
        description="Update pricing, features, and visibility for this plan."
      />

      {success ? (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <AdminFormCard>
        <SubscriptionPlanForm mode="edit" plan={plan} />
      </AdminFormCard>
    </AdminPage>
  );
}
