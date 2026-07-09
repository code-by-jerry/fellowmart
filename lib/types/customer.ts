export interface CustomerProfile {
  id: string;
  email: string | null;
  role: string;
  full_name: string | null;
  phone: string | null;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at?: string;
}

export type AddressLabel = "Home" | "Work" | "Other";

export interface CustomerAddress {
  id: string;
  user_id: string;
  label: AddressLabel;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddressInput {
  label: AddressLabel;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
}

export function formatAddressLine(address: Pick<
  CustomerAddress,
  "address_line1" | "address_line2" | "landmark" | "city" | "state" | "postal_code"
>): string {
  const parts = [
    address.address_line1,
    address.address_line2,
    address.landmark,
    `${address.city}, ${address.state} ${address.postal_code}`,
  ].filter(Boolean);

  return parts.join(", ");
}
