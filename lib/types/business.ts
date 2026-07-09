export const BUSINESS_TYPES = [
  { value: "general", label: "General / Supermarket", description: "Multiple categories in one store" },
  { value: "grocery", label: "Grocery & Essentials", description: "Daily needs, FMCG, provisions" },
  { value: "electronics", label: "Electronics", description: "Gadgets, appliances, accessories" },
  { value: "footwear", label: "Footwear", description: "Shoes, sandals, sports footwear" },
  { value: "clothing", label: "Clothing & Fashion", description: "Apparel and fashion retail" },
  { value: "textile", label: "Textile & Fabrics", description: "Fabrics, sarees, tailoring supplies" },
  { value: "pharmacy", label: "Pharmacy & Wellness", description: "Medicines and health products" },
  { value: "restaurant", label: "Food & Restaurant", description: "Prepared food and dining" },
  { value: "services", label: "Services", description: "Bookable or service-based business" },
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number]["value"];

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type TenantMembershipRole = "owner" | "admin" | "staff" | "customer";

export interface BusinessApplication {
  id: string;
  user_id?: string | null;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  business_name: string;
  business_slug: string;
  business_type: BusinessType;
  business_description?: string | null;
  address_line1?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string;
  status: ApplicationStatus;
  review_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  tenant_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantWithMembership {
  id: string;
  name: string;
  slug: string;
  business_type: BusinessType;
  onboarding_status?: string | null;
  is_active?: boolean;
  logo_url?: string | null;
  role: TenantMembershipRole;
}

export interface ProvisionTenantInput {
  businessName: string;
  businessSlug: string;
  businessType: BusinessType;
  ownerEmail: string;
  ownerName?: string;
  ownerPhone?: string;
  businessDescription?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  approvedByUserId?: string;
  onboardingStatus?: "pending" | "active" | "completed";
  isActive?: boolean;
}

export interface ProvisionTenantResult {
  tenantId: string;
  tenantSlug: string;
  ownerUserId: string;
  createdOwner: boolean;
}
