import Link from "next/link";
import { CheckCircle2, ChevronRight, Clock3, Store, XCircle } from "lucide-react";
import { ApplicationStatusBadge } from "@/components/admin/ApplicationStatusBadge";
import {
  AdminEmptyState,
  AdminListHeader,
  AdminPage,
  AdminPanel,
} from "@/components/admin/admin-ui";
import {
  BUSINESS_TYPE_LABELS,
  formatApplicationLocationShort,
} from "@/lib/admin/application-labels";
import { getAdminDataClient } from "@/lib/admin/auth";
import { storePath } from "@/lib/routes/store-routes";
import type { BusinessApplication } from "@/lib/types/business";

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
  const pendingCount = list.filter((item) => item.status === "pending").length;
  const approvedCount = list.filter((item) => item.status === "approved").length;
  const rejectedCount = list.filter((item) => item.status === "rejected").length;

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
          <p className="mt-2 text-2xl font-bold text-gray-900">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle2 size={16} />
            Approved
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{approvedCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <XCircle size={16} />
            Rejected
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{rejectedCount}</p>
        </div>
      </div>

      <AdminPanel>
        {list.length === 0 ? (
          <AdminEmptyState
            icon={<Store className="mx-auto h-8 w-8" />}
            message="No business applications yet."
          />
        ) : (
          <>
            <div className="divide-y md:hidden">
              {list.map((application) => (
                <div key={application.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">
                        {application.business_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {storePath(application.business_slug)}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={application.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-gray-400">Applicant</span>
                      <span className="font-medium text-gray-700">
                        {application.applicant_name}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400">Type</span>
                      <span className="font-medium text-gray-700">
                        {BUSINESS_TYPE_LABELS[application.business_type] ??
                          application.business_type}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-gray-400">Submitted</span>
                      <span className="font-medium text-gray-700">
                        {new Date(application.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/admin/dashboard/applications/${application.id}`}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Business
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Applicant
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((application) => (
                    <tr key={application.id} className="border-t last:border-b">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {application.business_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {storePath(application.business_slug)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {application.applicant_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {application.applicant_email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {BUSINESS_TYPE_LABELS[application.business_type] ??
                          application.business_type}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatApplicationLocationShort(application)}
                      </td>
                      <td className="px-4 py-3">
                        <ApplicationStatusBadge status={application.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(application.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/dashboard/applications/${application.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          View
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AdminPanel>
    </AdminPage>
  );
}
