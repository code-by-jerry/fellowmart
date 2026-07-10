import { redirect } from "next/navigation";
import { resolveCustomerStoreSlug } from "@/lib/tenant/active-store";
import { storePath } from "@/lib/routes/store-routes";

/** Legacy /profile → tenant-scoped storefront profile (keeps business theme). */
export default async function ProfileRedirectPage() {
  const slug = await resolveCustomerStoreSlug();
  redirect(storePath(slug, "profile"));
}
