import Link from "next/link";
import { requireTenantManager } from "@/lib/auth/business-access";
import { BUSINESS_TYPES } from "@/lib/types/business";
import { BusinessShell } from "@/components/business/BusinessShell";

const TYPE_LABELS = Object.fromEntries(
  BUSINESS_TYPES.map((type) => [type.value, type.label]),
);

export default async function TenantSettingsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const { data: tenantDetails } = await supabase
    .from("tenants")
    .select(
      "name, slug, business_type, contact_email, contact_phone, onboarding_status, is_active, logo_url, primary_color, business_description",
    )
    .eq("id", tenant.id)
    .single();

  return (
    <BusinessShell tenantSlug={tenant.slug} tenantName={tenant.name}>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="text-xl font-bold text-gray-900">Store settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Core business details for your Fellowmate store.
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400">Business name</dt>
            <dd className="mt-1 font-medium text-gray-900">{tenantDetails?.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400">Store URL</dt>
            <dd className="mt-1 font-medium text-gray-900">/{tenantDetails?.slug}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400">Business type</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {TYPE_LABELS[tenantDetails?.business_type as keyof typeof TYPE_LABELS] ??
                tenantDetails?.business_type}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400">Onboarding</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {tenantDetails?.onboarding_status ?? "pending"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400">Contact email</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {tenantDetails?.contact_email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray-400">Contact phone</dt>
            <dd className="mt-1 font-medium text-gray-900">
              {tenantDetails?.contact_phone ?? "—"}
            </dd>
          </div>
        </dl>

        {tenantDetails?.business_description ? (
          <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            {tenantDetails.business_description}
          </div>
        ) : null}

        <p className="mt-6 text-sm text-gray-500">
          Advanced branding and subscription controls are managed by Fellowmate during
          onboarding. Contact support if you need changes.
        </p>

        <Link
          href={`/${tenant.slug}`}
          target="_blank"
          className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Preview public storefront →
        </Link>
      </div>
    </BusinessShell>
  );
}
