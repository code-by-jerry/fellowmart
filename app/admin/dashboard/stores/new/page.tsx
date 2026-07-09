import { redirect } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin-server";
import { normalizeTenantSlug } from "@/lib/utils/tenant";

export default async function NewStorePage() {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  // Use API route for tenant creation to avoid server-action serialization issues

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">
              Create a new store
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Start onboarding a new tenant and set up the storefront entry
              details.
            </p>
          </div>
        </div>

        <form
          action="/api/admin/tenants/create"
          method="post"
          className="mt-8 grid gap-6"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Store name
              </label>
              <input
                name="name"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Your store name"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Store slug
              </label>
              <input
                name="slug"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="test-store"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Create store
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
