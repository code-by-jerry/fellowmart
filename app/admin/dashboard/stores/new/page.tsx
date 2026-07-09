import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin-server";
import {
  AdminFormActions,
  AdminFormCard,
  AdminFormField,
  AdminFormGrid,
  AdminPage,
  AdminPageHeader,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/admin-ui";
import { BUSINESS_TYPES } from "@/lib/types/business";

type NewStorePageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewStorePage({ searchParams }: NewStorePageProps) {
  const { error } = await searchParams;
  const supabase = await createAdminClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Create Business"
        description="Provision a new tenant manually with owner access and subscription state."
      />

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <AdminFormCard>
        <form action="/api/admin/tenants/create" method="post" className="space-y-6">
          <AdminFormGrid>
            <AdminFormField label="Business name" required>
              <input name="name" required className={adminInputClass} placeholder="City Mart" />
            </AdminFormField>

            <AdminFormField label="Store slug" required>
              <input
                name="slug"
                required
                className={adminInputClass}
                placeholder="city-mart"
              />
            </AdminFormField>

            <AdminFormField label="Business type" required>
              <select name="business_type" className={adminSelectClass} defaultValue="general">
                {BUSINESS_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </AdminFormField>

            <AdminFormField label="Onboarding status">
              <select name="onboarding_status" className={adminSelectClass} defaultValue="active">
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </AdminFormField>

            <AdminFormField label="Owner name">
              <input name="owner_name" className={adminInputClass} placeholder="Business owner" />
            </AdminFormField>

            <AdminFormField label="Owner email" required>
              <input
                name="owner_email"
                type="email"
                required
                className={adminInputClass}
                placeholder="owner@business.com"
              />
            </AdminFormField>

            <AdminFormField label="Owner phone">
              <input name="owner_phone" type="tel" className={adminInputClass} />
            </AdminFormField>

            <AdminFormField label="Business description" span={2}>
              <textarea
                name="business_description"
                rows={3}
                className={adminTextareaClass}
                placeholder="What does this business sell?"
              />
            </AdminFormField>
          </AdminFormGrid>

          <AdminFormActions>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Create business & assign owner
            </button>
          </AdminFormActions>
        </form>
      </AdminFormCard>
    </AdminPage>
  );
}
