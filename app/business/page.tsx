import Link from "next/link";
import { ArrowRight, ExternalLink, Plus, Store } from "lucide-react";
import { BusinessHomeBackdrop } from "@/components/business/BusinessHomeBackdrop";
import { getBusinessSession } from "@/lib/auth/business-access";
import { storePath } from "@/lib/routes/store-routes";
import { BUSINESS_TYPES } from "@/lib/types/business";

const TYPE_LABELS = Object.fromEntries(
  BUSINESS_TYPES.map((type) => [type.value, type.label]),
);

type BusinessHomePageProps = {
  searchParams: Promise<{ error?: string }>;
};

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${
        active ? "bg-emerald-500" : "bg-gray-300"
      }`}
      aria-hidden
    />
  );
}

export default async function BusinessHomePage({
  searchParams,
}: BusinessHomePageProps) {
  const { error } = await searchParams;
  const session = await getBusinessSession();

  if (!session) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <BusinessHomeBackdrop />
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/60 bg-white/85 p-8 text-center shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-md">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
            <Store size={18} />
          </div>
          <h1 className="mt-4 text-lg font-semibold tracking-tight text-gray-900">
            Business dashboard
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Sign in to manage your stores.
          </p>
          <Link
            href="/business/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const { tenants } = session;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BusinessHomeBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              Fellowmate
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
              Your businesses
            </h1>
          </div>
          <Link
            href="/apply"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gray-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
          >
            <Plus size={15} strokeWidth={2.25} />
            New store
          </Link>
        </header>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50/90 px-3.5 py-2.5 text-sm text-red-700 backdrop-blur-sm">
            {error}
          </div>
        ) : null}

        {tenants.length === 0 ? (
          <div className="rounded-2xl border border-white/70 bg-white/80 px-6 py-12 text-center shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-md">
            <Store className="mx-auto h-8 w-8 text-gray-300" />
            <h2 className="mt-3 text-base font-semibold text-gray-900">
              No businesses yet
            </h2>
            <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500">
              Apply to open a store. We’ll review and onboard you.
            </p>
            <Link
              href="/apply"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Start application
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-md">
            <ul className="divide-y divide-gray-100/80">
              {tenants.map((tenant) => {
                const typeLabel =
                  TYPE_LABELS[tenant.business_type] ?? tenant.business_type;
                const storefront = storePath(tenant.slug);

                return (
                  <li key={tenant.id}>
                    <div className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                        style={{ backgroundColor: "#111827" }}
                        aria-hidden
                      >
                        {(tenant.name || "?").charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <h2 className="truncate text-sm font-semibold text-gray-900">
                            {tenant.name}
                          </h2>
                          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium capitalize text-gray-600">
                            {tenant.role}
                          </span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                          <span className="truncate">{storefront}</span>
                          <span className="hidden text-gray-300 sm:inline">·</span>
                          <span className="hidden truncate sm:inline">{typeLabel}</span>
                          <span className="text-gray-300">·</span>
                          <span className="inline-flex items-center gap-1.5">
                            <StatusDot active={Boolean(tenant.is_active)} />
                            {tenant.is_active ? "Live" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <Link
                          href={storefront}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-gray-700"
                          aria-label={`Open ${tenant.name} storefront`}
                          title="Storefront"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <Link
                          href={`/business/${tenant.slug}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800"
                        >
                          Open
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
