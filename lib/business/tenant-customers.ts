import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/utils/supabase/service-role-client";
import { formatAddressLine, type CustomerAddress } from "@/lib/types/customer";

export type TenantCustomerSummary = {
  key: string;
  userId: string | null;
  email: string;
  name: string;
  phone: string | null;
  source: string;
  orderCount: number;
  totalSpent: number;
  lastSeenAt: string;
  lastOrderAt: string | null;
};

export type TenantCustomerOrder = {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address: Record<string, unknown> | null;
};

function customerKey(row: { id: string }) {
  return row.id;
}

export async function listTenantCustomers(
  db: SupabaseClient,
  tenantId: string,
): Promise<TenantCustomerSummary[]> {
  const { data, error } = await db
    .from("tenant_customers")
    .select(
      "id, user_id, email, name, phone, source, order_count, total_spent, last_seen_at, last_order_at",
    )
    .eq("tenant_id", tenantId)
    .order("last_seen_at", { ascending: false });

  if (error || !data?.length) return [];

  return data.map((row) => ({
    key: customerKey(row),
    userId: row.user_id,
    email: row.email,
    name: row.name || row.email.split("@")[0] || "Customer",
    phone: row.phone,
    source: row.source,
    orderCount: Number(row.order_count) || 0,
    totalSpent: Number(row.total_spent) || 0,
    lastSeenAt: row.last_seen_at,
    lastOrderAt: row.last_order_at,
  }));
}

export async function getTenantCustomerDetail(
  db: SupabaseClient,
  tenantId: string,
  customerKeyParam: string,
) {
  const { data: row, error } = await db
    .from("tenant_customers")
    .select(
      "id, user_id, email, name, phone, source, order_count, total_spent, last_seen_at, last_order_at, first_seen_at",
    )
    .eq("tenant_id", tenantId)
    .eq("id", customerKeyParam)
    .maybeSingle();

  if (error || !row) return null;

  let name = row.name || row.email.split("@")[0] || "Customer";
  let email = row.email;
  let phone = row.phone;
  let addresses: CustomerAddress[] = [];

  if (row.user_id) {
    try {
      const admin = createServiceRoleClient();
      const [{ data: profile }, { data: addressRows }] = await Promise.all([
        admin
          .from("profiles")
          .select("id, email, full_name, phone")
          .eq("id", row.user_id)
          .maybeSingle(),
        admin
          .from("customer_addresses")
          .select("*")
          .eq("user_id", row.user_id)
          .order("is_default", { ascending: false }),
      ]);
      if (profile) {
        name = profile.full_name ?? name;
        email = profile.email ?? email;
        phone = profile.phone ?? phone;
      }
      addresses = (addressRows as CustomerAddress[] | null) ?? [];
    } catch {
      // optional enrichment
    }
  }

  let orders: TenantCustomerOrder[] = [];
  try {
    const { data } = await db
      .from("orders")
      .select(
        "id, order_number, status, total_amount, created_at, shipping_address, customer_email, customer_name",
      )
      .eq("tenant_id", tenantId)
      .ilike("customer_email", row.email)
      .order("created_at", { ascending: false });
    orders = (data as TenantCustomerOrder[] | null) ?? [];
  } catch {
    orders = [];
  }

  const latestShipping =
    (orders[0]?.shipping_address as Record<string, unknown> | null) ?? null;

  return {
    key: row.id,
    userId: row.user_id as string | null,
    name,
    email,
    phone,
    source: row.source as string,
    orderCount: Number(row.order_count) || orders.length || 0,
    totalSpent: Number(row.total_spent) || 0,
    firstSeenAt: row.first_seen_at as string,
    lastSeenAt: row.last_seen_at as string,
    addresses,
    orders,
    latestShipping,
  };
}

export function formatShippingSnippet(
  shipping: Record<string, unknown> | null,
): string | null {
  if (!shipping) return null;
  const line1 = typeof shipping.address_line1 === "string" ? shipping.address_line1 : "";
  const city = typeof shipping.city === "string" ? shipping.city : "";
  const state = typeof shipping.state === "string" ? shipping.state : "";
  const postal =
    typeof shipping.postal_code === "string" ? shipping.postal_code : "";
  if (!line1 && !city) return null;
  return formatAddressLine({
    address_line1: line1 || "—",
    address_line2:
      typeof shipping.address_line2 === "string" ? shipping.address_line2 : null,
    landmark: typeof shipping.landmark === "string" ? shipping.landmark : null,
    city: city || "—",
    state: state || "—",
    postal_code: postal || "",
  });
}
