export type SubscriptionBillingPeriod = "free" | "monthly" | "yearly" | "custom";

export interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  price_amount?: number | null;
  price_currency: string;
  price_display: string;
  billing_period: SubscriptionBillingPeriod;
  features: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type SubscriptionPlanInput = {
  slug: string;
  name: string;
  description?: string | null;
  price_amount?: number | null;
  price_currency?: string;
  price_display: string;
  billing_period: SubscriptionBillingPeriod;
  features: string[];
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
};
