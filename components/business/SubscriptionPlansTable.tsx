"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Crown, Sparkles } from "lucide-react";
import {
  adminBtnPrimaryClass,
  adminBtnSecondaryClass,
  AdminPanel,
} from "@/components/admin/admin-ui";
import type { SubscriptionPlan } from "@/lib/types/subscription-plan";

type SubscriptionPlansTableProps = {
  tenantSlug: string;
  currentPlanSlug: string;
  subscriptionStatus: string;
  subscriptionActive: boolean;
  since?: string | null;
  plans: SubscriptionPlan[];
};

function planRank(plan: SubscriptionPlan) {
  if (typeof plan.price_amount === "number") return plan.price_amount;
  if (plan.billing_period === "custom") return Number.MAX_SAFE_INTEGER;
  return plan.sort_order;
}

export function SubscriptionPlansTable({
  tenantSlug,
  currentPlanSlug,
  subscriptionStatus,
  subscriptionActive,
  since,
  plans,
}: SubscriptionPlansTableProps) {
  const router = useRouter();
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = useMemo(
    () => plans.find((plan) => plan.slug === currentPlanSlug) ?? null,
    [plans, currentPlanSlug],
  );

  const currentRank = currentPlan ? planRank(currentPlan) : 0;

  const changePlan = async (plan: SubscriptionPlan) => {
    if (plan.slug === currentPlanSlug || busySlug) return;

    if (plan.billing_period === "custom") {
      window.location.href = "mailto:contact@codebyjerry.online?subject=Enterprise%20plan%20inquiry";
      return;
    }

    const isUpgrade = planRank(plan) > currentRank;
    const confirmed = window.confirm(
      isUpgrade
        ? `Switch to ${plan.name} (${plan.price_display})? Your plan updates immediately.`
        : `Switch to ${plan.name} (${plan.price_display})? This will take effect immediately.`,
    );
    if (!confirmed) return;

    setBusySlug(plan.slug);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/business/subscription/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_slug: tenantSlug,
          plan_slug: plan.slug,
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error ?? "Could not update plan");
        setBusySlug(null);
        return;
      }

      setMessage(`Plan updated to ${plan.name}.`);
      setBusySlug(null);
      router.refresh();
    } catch {
      setError("Could not update plan");
      setBusySlug(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-gray-500">
          Compare plans and switch instantly — no application wait.
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
          <span className="rounded bg-gray-900 px-1.5 py-0.5 font-medium text-white">
            {currentPlan?.name ?? currentPlanSlug}
          </span>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium capitalize text-gray-600">
            {subscriptionStatus}
          </span>
          <span className="text-gray-400">
            {subscriptionActive ? "Active" : "Inactive"}
            {since ? ` · since ${new Date(since).toLocaleDateString()}` : ""}
          </span>
        </div>
      </div>

      {message ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </div>
      ) : null}

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {plans.map((plan) => {
          const isCurrent = plan.slug === currentPlanSlug;
          const isCustom = plan.billing_period === "custom";
          const isUpgrade = planRank(plan) > currentRank;

          return (
            <AdminPanel key={plan.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-semibold text-gray-900">{plan.name}</p>
                    {plan.is_featured ? (
                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                        <Sparkles size={10} /> Popular
                      </span>
                    ) : null}
                    {isCurrent ? (
                      <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                        Current
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[15px] font-semibold text-gray-900">
                    {plan.price_display}
                  </p>
                </div>
              </div>
              <ul className="mt-2 space-y-1">
                {plan.features.slice(0, 4).map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-1.5 text-[12px] text-gray-600"
                  >
                    <Check size={12} className="mt-0.5 shrink-0 text-gray-900" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                {isCurrent ? (
                  <button type="button" disabled className={`${adminBtnSecondaryClass} w-full opacity-60`}>
                    Current plan
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={Boolean(busySlug)}
                    onClick={() => void changePlan(plan)}
                    className={`${adminBtnPrimaryClass} w-full`}
                  >
                    {busySlug === plan.slug
                      ? "Updating…"
                      : isCustom
                        ? "Contact sales"
                        : isUpgrade
                          ? `Upgrade to ${plan.name}`
                          : `Switch to ${plan.name}`}
                  </button>
                )}
              </div>
            </AdminPanel>
          );
        })}
      </div>

      {/* Desktop comparison table */}
      <AdminPanel className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f7f7f7]">
                <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                  Plan
                </th>
                <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                  Price
                </th>
                <th className="px-3 py-2 text-left text-[12px] font-semibold text-gray-600">
                  Includes
                </th>
                <th className="px-3 py-2 text-right text-[12px] font-semibold text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => {
                const isCurrent = plan.slug === currentPlanSlug;
                const isCustom = plan.billing_period === "custom";
                const isUpgrade = planRank(plan) > currentRank;

                return (
                  <tr
                    key={plan.id}
                    className={`border-b border-gray-100 last:border-0 ${
                      isCurrent ? "bg-[#fafafa]" : ""
                    }`}
                  >
                    <td className="px-3 py-3 align-top">
                      <div className="flex items-center gap-1.5">
                        {isCurrent ? (
                          <Crown size={13} className="text-gray-700" />
                        ) : null}
                        <span className="font-semibold text-gray-900">{plan.name}</span>
                        {plan.is_featured ? (
                          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                            Popular
                          </span>
                        ) : null}
                        {isCurrent ? (
                          <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                            Current
                          </span>
                        ) : null}
                      </div>
                      {plan.description ? (
                        <p className="mt-0.5 max-w-xs text-[12px] text-gray-500">
                          {plan.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 align-top font-medium text-gray-900">
                      {plan.price_display}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <ul className="space-y-1">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-1.5 text-[12px] text-gray-600"
                          >
                            <Check
                              size={12}
                              className="mt-0.5 shrink-0 text-gray-800"
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-3 py-3 align-top text-right">
                      {isCurrent ? (
                        <button
                          type="button"
                          disabled
                          className={`${adminBtnSecondaryClass} opacity-60`}
                        >
                          Current plan
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={Boolean(busySlug)}
                          onClick={() => void changePlan(plan)}
                          className={adminBtnPrimaryClass}
                        >
                          {busySlug === plan.slug
                            ? "Updating…"
                            : isCustom
                              ? "Contact sales"
                              : isUpgrade
                                ? "Upgrade"
                                : "Switch"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <p className="text-[11px] text-gray-400">
        Plan changes apply immediately to this store. Enterprise / custom pricing
        is handled by sales.
      </p>
    </div>
  );
}
