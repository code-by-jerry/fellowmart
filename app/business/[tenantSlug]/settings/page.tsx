import { requireTenantManager } from "@/lib/auth/business-access";
import {
  StoreSettingsForm,
  type StoreSettingsFormValues,
} from "@/components/business/StoreSettingsForm";

export default async function TenantSettingsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const { supabase, tenant } = await requireTenantManager(tenantSlug);

  const [{ data: tenantDetails }, { data: teamRequests }] = await Promise.all([
    supabase
      .from("tenants")
      .select(
        "name, slug, business_type, contact_email, contact_phone, onboarding_status, business_description, currency, logo_url, favicon_url, primary_color, meta_title, meta_description, meta_keywords, announcement_text, announcement_promo, footer_description, home_hero_eyebrow, home_hero_title, home_hero_description",
      )
      .eq("id", tenant.id)
      .single(),
    supabase
      .from("team_access_requests")
      .select("id, member_email, requested_role, status, created_at")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (!tenantDetails) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
        Could not load store settings.
      </div>
    );
  }

  const initial: StoreSettingsFormValues = {
    name: tenantDetails.name,
    slug: tenantDetails.slug,
    business_type: tenantDetails.business_type,
    onboarding_status: tenantDetails.onboarding_status,
    contact_email: tenantDetails.contact_email,
    contact_phone: tenantDetails.contact_phone,
    business_description: tenantDetails.business_description,
    currency: tenantDetails.currency ?? "INR",
    logo_url: tenantDetails.logo_url,
    favicon_url: tenantDetails.favicon_url,
    primary_color: tenantDetails.primary_color,
    meta_title: tenantDetails.meta_title,
    meta_description: tenantDetails.meta_description,
    meta_keywords: tenantDetails.meta_keywords,
    announcement_text: tenantDetails.announcement_text,
    announcement_promo: tenantDetails.announcement_promo,
    footer_description: tenantDetails.footer_description,
    home_hero_eyebrow: tenantDetails.home_hero_eyebrow,
    home_hero_title: tenantDetails.home_hero_title,
    home_hero_description: tenantDetails.home_hero_description,
  };

  return (
    <StoreSettingsForm
      tenantSlug={tenant.slug}
      initial={initial}
      teamRequests={teamRequests ?? []}
    />
  );
}
