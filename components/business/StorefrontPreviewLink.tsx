import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { storePath } from "@/lib/routes/store-routes";

type StorefrontPreviewLinkProps = {
  tenantSlug: string;
  href?: string;
  label?: string;
  className?: string;
  variant?: "button" | "link";
};

export function StorefrontPreviewLink({
  tenantSlug,
  href,
  label = "View on storefront",
  className = "",
  variant = "button",
}: StorefrontPreviewLinkProps) {
  const target = href ?? storePath(tenantSlug);

  if (variant === "link") {
    return (
      <Link
        href={target}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline ${className}`}
      >
        {label}
        <ExternalLink size={14} />
      </Link>
    );
  }

  return (
    <Link
      href={target}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 ${className}`}
    >
      <ExternalLink size={16} />
      {label}
    </Link>
  );
}

export function productStorefrontPath(
  tenantSlug: string,
  categorySlug: string | null | undefined,
  productSlug: string,
) {
  if (!categorySlug) {
    return storePath(tenantSlug, "categories");
  }
  return storePath(tenantSlug, `categories/${categorySlug}/${productSlug}`);
}
