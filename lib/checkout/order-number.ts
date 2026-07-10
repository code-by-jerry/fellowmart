export function generateOrderNumber(tenantSlug: string): string {
  const prefix =
    tenantSlug.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase() || "FM";
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}
