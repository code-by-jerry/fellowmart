import { SubscriptionPlanForm } from "@/components/admin/SubscriptionPlanForm";
import {
  AdminFormCard,
  AdminPage,
  AdminPageHeader,
} from "@/components/admin/admin-ui";

type NewSubscriptionPlanPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewSubscriptionPlanPage({
  searchParams,
}: NewSubscriptionPlanPageProps) {
  const { error } = await searchParams;

  return (
    <AdminPage>
      <AdminPageHeader
        title="Create subscription plan"
        description="Add a new pricing tier for stores and the public landing page."
      />

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <AdminFormCard>
        <SubscriptionPlanForm mode="create" />
      </AdminFormCard>
    </AdminPage>
  );
}
