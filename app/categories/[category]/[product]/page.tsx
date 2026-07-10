import { redirect } from "next/navigation";

export default async function LegacyProductRedirect({
  params,
}: {
  params: Promise<{ category: string; product: string }>;
}) {
  const { category, product } = await params;
  redirect(`/store/fellowmart/categories/${category}/${product}`);
}
