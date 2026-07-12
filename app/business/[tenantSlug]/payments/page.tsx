import { AdminPanel } from "@/components/admin/admin-ui";
import { isRazorpayEnabled } from "@/lib/payments/razorpay-config";
import { CreditCard } from "lucide-react";

export default async function BusinessPaymentsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  // Auth enforced in business/[tenantSlug]/layout.tsx
  await params;
  const enabled = isRazorpayEnabled();

  return (
    <AdminPanel>
      <div className="space-y-4 px-4 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">
              Razorpay payments
            </h2>
            <p className="text-[13px] text-gray-500">
              Platform-level keys from server environment (test or live mode).
            </p>
          </div>
        </div>

        <div
          className={`rounded-xl border px-4 py-3 text-[13px] ${
            enabled
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {enabled
            ? "Razorpay is configured. Customers can pay online at checkout."
            : "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local."}
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-[13px] text-gray-600">
          <p className="font-medium text-gray-900">Webhook URL</p>
          <code className="mt-2 block break-all rounded bg-white px-2 py-1.5 text-[12px]">
            {process.env.NEXT_PUBLIC_APP_URL
              ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/razorpay`
              : "https://your-domain.com/api/webhooks/razorpay"}
          </code>
          <p className="mt-3">
            Enable events: <strong>payment.captured</strong>,{" "}
            <strong>payment.failed</strong>. Set the webhook secret as{" "}
            <code>RAZORPAY_WEBHOOK_SECRET</code>.
          </p>
        </div>
      </div>
    </AdminPanel>
  );
}
