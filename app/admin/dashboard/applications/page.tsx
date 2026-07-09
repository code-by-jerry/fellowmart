import Link from "next/link";
import { CheckCircle2, Clock3, Store, XCircle } from "lucide-react";
import {
  AdminEmptyState,
  AdminListHeader,
  AdminPage,
  AdminPanel,
} from "@/components/admin/admin-ui";
import { BUSINESS_TYPES } from "@/lib/types/business";
import { getAdminDataClient } from "@/lib/admin/auth";
import type { BusinessApplication } from "@/lib/types/business";

const TYPE_LABELS = Object.fromEntries(
  BUSINESS_TYPES.map((type) => [type.value, type.label]),
);

type ApplicationsPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const { success, error } = await searchParams;
  const db = await getAdminDataClient();

  const { data: applications } = await db
    .from("business_applications")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (applications ?? []) as BusinessApplication[];
  const pending = list.filter((item) => item.status === "pending");

  return (
    <AdminPage className="space-y-4 sm:space-y-6">
      <AdminListHeader
        title="Business Applications"
        description="Review onboarding requests from business owners before provisioning their store."
        action={
          <Link
            href="/admin/dashboard/stores/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <Store size={16} />
            Create business manually
          </Link>
        }
      />

      {success ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock3 size={16} />
            Pending review
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{pending.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle2 size={16} />
            Approved
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {list.filter((item) => item.status === "approved").length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <XCircle size={16} />
            Rejected
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {list.filter((item) => item.status === "rejected").length}
          </p>
        </div>
      </div>

      <AdminPanel>
        {list.length === 0 ? (
          <AdminEmptyState
            icon={<Store className="mx-auto h-8 w-8" />}
            message="No business applications yet."
          />
        ) : (
          <div className="divide-y">
            {list.map((application) => (
              <div key={application.id} className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.business_name}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          application.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : application.status === "approved"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {application.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      /{application.business_slug} ·{" "}
                      {TYPE_LABELS[application.business_type] ?? application.business_type}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Submitted {new Date(application.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Applicant</p>
                    <p className="font-medium text-gray-900">{application.applicant_name}</p>
                    <p className="text-gray-500">{application.applicant_email}</p>
                    <p className="text-gray-500">{application.applicant_phone}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Location</p>
                    <p className="text-gray-700">
                      {[application.address_line1, application.city, application.state]
                        .filter(Boolean)
                        .join(", ") || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Description</p>
                    <p className="text-gray-700">
                      {application.business_description || "Not provided"}
                    </p>
                  </div>
                </div>

                {application.review_notes ? (
                  <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    Review notes: {application.review_notes}
                  </p>
                ) : null}

                {application.status === "pending" ? (
                  <div className="flex flex-col gap-3 lg:flex-row">
                    <form
                      action="/api/admin/applications/approve"
                      method="post"
                      className="flex flex-1 flex-col gap-2 rounded-xl border border-green-200 bg-green-50/60 p-4"
                    >
                      <input type="hidden" name="application_id" value={application.id} />
                      <label className="text-sm font-medium text-gray-700">
                        Approval notes (optional)
                      </label>
                      <input
                        name="review_notes"
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        placeholder="Approved for starter plan"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                      >
                        Approve & provision store
                      </button>
                    </form>

                    <form
                      action="/api/admin/applications/reject"
                      method="post"
                      className="flex flex-1 flex-col gap-2 rounded-xl border border-red-200 bg-red-50/60 p-4"
                    >
                      <input type="hidden" name="application_id" value={application.id} />
                      <label className="text-sm font-medium text-gray-700">
                        Rejection reason
                      </label>
                      <input
                        name="review_notes"
                        required
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        placeholder="Missing business details"
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700"
                      >
                        Reject application
                      </button>
                    </form>
                  </div>
                ) : application.tenant_id ? (
                  <Link
                    href={`/admin/dashboard/stores/${application.business_slug}/settings`}
                    className="inline-flex text-sm font-medium text-primary hover:underline"
                  >
                    Open tenant in superadmin →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </AdminPanel>
    </AdminPage>
  );
}
