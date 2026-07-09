export function normalizeTenantSlug(value?: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getTenantFromParams(
  params:
    | { tenant?: string | string[] }
    | Promise<{ tenant?: string | string[] }>,
) {
  if (params instanceof Promise) {
    return "";
  }

  const tenant = params.tenant;
  if (Array.isArray(tenant)) {
    return tenant[0] ?? "";
  }

  return tenant ?? "";
}
