"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { adminBtnDangerClass } from "@/components/admin/admin-ui";

type CatalogDeleteButtonProps = {
  tenantSlug: string;
  itemId: string;
  itemLabel: string;
  endpoint: string;
  bodyKey:
    | "category_id"
    | "collection_id"
    | "product_id"
    | "brand_id"
    | "banner_id"
    | "post_id"
    | "page_id";
  redirectPath: string;
};

export function CatalogDeleteButton({
  tenantSlug,
  itemId,
  itemLabel,
  endpoint,
  bodyKey,
  redirectPath,
}: CatalogDeleteButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${itemLabel}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setError(null);

    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_slug: tenantSlug,
        [bodyKey]: itemId,
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(json.error ?? "Delete failed");
      setDeleting(false);
      return;
    }

    router.push(redirectPath);
    router.refresh();
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className={adminBtnDangerClass}
      >
        <Trash2 size={13} />
        {deleting ? "Deleting…" : "Delete"}
      </button>
      {error ? <span className="text-[11px] text-red-600">{error}</span> : null}
    </div>
  );
}
