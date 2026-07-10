"use client";

import Link from "next/link";
import {
  AdminFormActions,
  AdminFormField,
  AdminFormGrid,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/admin-ui";
import { slugify } from "@/lib/admin/slugify";
import { serializeFeaturesInput } from "@/lib/subscriptions/plan-utils";
import type { SubscriptionPlan } from "@/lib/types/subscription-plan";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type SubscriptionPlanFormProps = {
  mode: "create" | "edit";
  plan?: SubscriptionPlan;
};

export function SubscriptionPlanForm({ mode, plan }: SubscriptionPlanFormProps) {
  const [slug, setSlug] = useState(plan?.slug ?? "");

  const action =
    mode === "create"
      ? "/api/admin/subscription-plans/create"
      : "/api/admin/subscription-plans/update";

  return (
    <form action={action} method="post" className="space-y-6">
      {mode === "edit" && plan ? (
        <input type="hidden" name="plan_id" value={plan.id} />
      ) : null}

      <AdminFormGrid>
        <AdminFormField label="Plan name" required>
          <input
            name="name"
            required
            defaultValue={plan?.name ?? ""}
            placeholder="Growth"
            className={adminInputClass}
            onChange={(event) => {
              if (mode === "create" && !slug) {
                setSlug(slugify(event.target.value));
              }
            }}
          />
        </AdminFormField>

        <AdminFormField
          label="Slug"
          hint="Used when assigning plans to stores. Cannot be changed after creation."
          required
        >
          {mode === "create" ? (
            <input
              name="slug"
              required
              value={slug}
              onChange={(event) => setSlug(slugify(event.target.value))}
              placeholder="growth"
              className={adminInputClass}
            />
          ) : (
            <>
              <input type="hidden" name="slug" value={plan?.slug ?? ""} />
              <input
                value={plan?.slug ?? ""}
                readOnly
                className={`${adminInputClass} bg-gray-50 text-gray-500`}
              />
            </>
          )}
        </AdminFormField>

        <AdminFormField label="Price display" required span={2}>
          <input
            name="price_display"
            required
            defaultValue={plan?.price_display ?? ""}
            placeholder="₹1,499/mo"
            className={adminInputClass}
          />
        </AdminFormField>

        <AdminFormField label="Price amount" hint="Optional numeric value for reporting.">
          <input
            name="price_amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={plan?.price_amount ?? ""}
            placeholder="1499"
            className={adminInputClass}
          />
        </AdminFormField>

        <AdminFormField label="Currency">
          <input
            name="price_currency"
            defaultValue={plan?.price_currency ?? "INR"}
            className={adminInputClass}
          />
        </AdminFormField>

        <AdminFormField label="Billing period">
          <select
            name="billing_period"
            defaultValue={plan?.billing_period ?? "monthly"}
            className={adminSelectClass}
          >
            <option value="free">Free</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </AdminFormField>

        <AdminFormField label="Sort order">
          <input
            name="sort_order"
            type="number"
            defaultValue={plan?.sort_order ?? 0}
            className={adminInputClass}
          />
        </AdminFormField>

        <AdminFormField label="Description" span={2}>
          <textarea
            name="description"
            rows={3}
            defaultValue={plan?.description ?? ""}
            placeholder="Short summary shown on the landing page"
            className={adminTextareaClass}
          />
        </AdminFormField>

        <AdminFormField
          label="Features"
          hint="One feature per line. Shown on the public pricing section."
          span={2}
        >
          <textarea
            name="features"
            rows={6}
            defaultValue={serializeFeaturesInput(plan?.features ?? [])}
            placeholder={"Dedicated storefront\nCatalog management\nOrder dashboard"}
            className={adminTextareaClass}
          />
        </AdminFormField>

        <AdminFormField label="Visibility">
          <label className="flex h-11 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/80 px-4">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={plan?.is_active ?? true}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Plan is active</span>
          </label>
        </AdminFormField>

        <AdminFormField label="Highlight">
          <label className="flex h-11 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/80 px-4">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={plan?.is_featured ?? false}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">
              Mark as featured on pricing
            </span>
          </label>
        </AdminFormField>
      </AdminFormGrid>

      <AdminFormActions>
        <Link
          href="/admin/dashboard/subscription-plans"
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </Link>
        <Button type="submit">
          {mode === "create" ? "Create plan" : "Save changes"}
        </Button>
      </AdminFormActions>
    </form>
  );
}
