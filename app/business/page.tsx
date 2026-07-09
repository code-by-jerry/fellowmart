import Link from "next/link";
import { PlusCircle, Store } from "lucide-react";
import { getBusinessSession } from "@/lib/auth/business-access";
import { BUSINESS_TYPES } from "@/lib/types/business";

const TYPE_LABELS = Object.fromEntries(
  BUSINESS_TYPES.map((type) => [type.value, type.label]),
);

type BusinessHomePageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function BusinessHomePage({
  searchParams,
}: BusinessHomePageProps) {
  const { error } = await searchParams;
  const session = await getBusinessSession();

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <Store className="mx-auto h-10 w-10 text-gray-300" />
          <h1 className="mt-4 text-xl font-bold text-gray-900">Business dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your Fellowmate stores.
          </p>
          <Link
            href="/login?next=/business"
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const { tenants } = session;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Fellowmate Business
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Your businesses</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage the stores you own or operate on Fellowmate.
            </p>
          </div>
          <Link
            href="/apply"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <PlusCircle size={16} />
            Apply for a new store
          </Link>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {tenants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <Store className="mx-auto h-10 w-10 text-gray-300" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">No businesses yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              Submit an application and our team will review and onboard your store.
            </p>
            <Link
              href="/apply"
              className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Start application
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tenants.map((tenant) => (
              <Link
                key={tenant.id}
                href={`/business/${tenant.slug}`}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{tenant.name}</h2>
                    <p className="text-sm text-gray-500">/{tenant.slug}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {tenant.role}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  {TYPE_LABELS[tenant.business_type] ?? tenant.business_type}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span
                    className={`rounded-full px-2.5 py-1 font-medium ${
                      tenant.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tenant.is_active ? "live" : "inactive"}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                    {tenant.onboarding_status ?? "pending"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
