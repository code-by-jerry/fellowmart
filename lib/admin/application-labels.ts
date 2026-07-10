import { BUSINESS_TYPES } from "@/lib/types/business";
import type { BusinessApplication } from "@/lib/types/business";

export const BUSINESS_TYPE_LABELS = Object.fromEntries(
  BUSINESS_TYPES.map((type) => [type.value, type.label]),
) as Record<string, string>;

export function formatApplicationLocation(
  application: Pick<
    BusinessApplication,
    "address_line1" | "city" | "state" | "postal_code" | "country"
  >,
): string {
  const parts = [
    application.address_line1,
    application.city,
    application.state,
    application.postal_code,
    application.country && application.country !== "IN"
      ? application.country
      : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Not provided";
}

export function formatApplicationLocationShort(
  application: Pick<BusinessApplication, "city" | "state">,
): string {
  const parts = [application.city, application.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}
