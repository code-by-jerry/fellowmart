export type ProfileRole = "admin" | "customer";

/** Sole platform admin account — override via PLATFORM_ADMIN_EMAIL env. */
export const PLATFORM_ADMIN_EMAIL = (
  process.env.PLATFORM_ADMIN_EMAIL ?? "contact@codebyjerry.online"
)
  .trim()
  .toLowerCase();

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isPlatformAdminEmail(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  return normalizeEmail(email) === PLATFORM_ADMIN_EMAIL;
}

export function isPlatformAdminProfile(
  profile:
    | { role?: string | null; email?: string | null }
    | null
    | undefined,
): boolean {
  return profile?.role === "admin" && isPlatformAdminEmail(profile.email);
}
