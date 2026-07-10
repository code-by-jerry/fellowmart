import Link from "next/link";
import { redirect } from "next/navigation";

/** Legacy marketplace categories → demo store */
export default function LegacyCategoriesRedirect() {
  redirect("/store/fellowmart/categories");
}
