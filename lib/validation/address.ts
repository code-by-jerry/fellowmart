import type { AddressLabel, CustomerAddressInput } from "@/lib/types/customer";

export function parseAddressInput(formData: FormData): CustomerAddressInput | { error: string } {
  const label = cleanText(formData.get("label"), true) as AddressLabel | null;
  const full_name = cleanText(formData.get("full_name"), true);
  const phone = cleanText(formData.get("phone"), true);
  const address_line1 = cleanText(formData.get("address_line1"), true);
  const city = cleanText(formData.get("city"), true);
  const state = cleanText(formData.get("state"), true);
  const postal_code = cleanText(formData.get("postal_code"), true);

  if (!label || !full_name || !phone || !address_line1 || !city || !state || !postal_code) {
    return { error: "Please fill in all required address fields." };
  }

  if (!["Home", "Work", "Other"].includes(label)) {
    return { error: "Please choose a valid address label." };
  }

  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length < 10) {
    return { error: "Please enter a valid phone number." };
  }

  if (!/^\d{6}$/.test(postal_code)) {
    return { error: "Please enter a valid 6-digit PIN code." };
  }

  return {
    label,
    full_name,
    phone: digitsOnly,
    address_line1,
    address_line2: cleanText(formData.get("address_line2")) ?? undefined,
    landmark: cleanText(formData.get("landmark")) ?? undefined,
    city,
    state,
    postal_code,
    country: cleanText(formData.get("country")) ?? "IN",
    is_default: formData.get("is_default") === "on",
  };
}

function cleanText(value: FormDataEntryValue | null, required = false): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text && required) return null;
  return text || null;
}
