"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BUSINESS_TYPES } from "@/lib/types/business";
import { normalizeTenantSlug } from "@/lib/utils/tenant";
import {
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
} from "@/components/admin/admin-ui";

type BusinessApplicationFormProps = {
  defaultValues?: {
    applicant_name?: string;
    applicant_email?: string;
    applicant_phone?: string;
  };
};

export function BusinessApplicationForm({
  defaultValues,
}: BusinessApplicationFormProps) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [businessSlug, setBusinessSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const suggestedSlug = useMemo(
    () => normalizeTenantSlug(businessName),
    [businessName],
  );

  const handleNameChange = (value: string) => {
    setBusinessName(value);
    if (!slugTouched) {
      setBusinessSlug(normalizeTenantSlug(value));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    formData.set("business_slug", normalizeTenantSlug(businessSlug || businessName));

    const response = await fetch("/api/business/apply", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload.error ?? "Could not submit your application.");
      setSubmitting(false);
      return;
    }

    setMessage(
      "Application submitted. Our team will review it and email you once your business is approved.",
    );
    setSubmitting(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Your full name <span className="text-red-500">*</span>
          </label>
          <input
            name="applicant_name"
            required
            defaultValue={defaultValues?.applicant_name ?? ""}
            className={adminInputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            name="applicant_email"
            type="email"
            required
            defaultValue={defaultValues?.applicant_email ?? ""}
            className={adminInputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            name="applicant_phone"
            type="tel"
            required
            defaultValue={defaultValues?.applicant_phone ?? ""}
            className={adminInputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Business name <span className="text-red-500">*</span>
          </label>
          <input
            name="business_name"
            required
            value={businessName}
            onChange={(event) => handleNameChange(event.target.value)}
            className={adminInputClass}
            placeholder="e.g. City Mart Grocers"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Store URL slug <span className="text-red-500">*</span>
          </label>
          <input
            name="business_slug"
            required
            value={businessSlug || suggestedSlug}
            onChange={(event) => {
              setSlugTouched(true);
              setBusinessSlug(normalizeTenantSlug(event.target.value));
            }}
            className={adminInputClass}
            placeholder="city-mart-grocers"
          />
          <p className="text-xs text-gray-400">
            Public store: /{businessSlug || suggestedSlug || "your-store"}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Business type <span className="text-red-500">*</span>
          </label>
          <select name="business_type" required className={adminSelectClass} defaultValue="general">
            {BUSINESS_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5 lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            About your business
          </label>
          <textarea
            name="business_description"
            rows={3}
            className={adminTextareaClass}
            placeholder="What do you sell? Who are your customers?"
          />
        </div>

        <div className="space-y-1.5 lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Business address
          </label>
          <input name="address_line1" className={adminInputClass} placeholder="Street address" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input name="city" className={adminInputClass} />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input name="state" className={adminInputClass} />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">PIN code</label>
          <input name="postal_code" className={adminInputClass} />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Submitting..." : "Submit application"}
      </button>
    </form>
  );
}
