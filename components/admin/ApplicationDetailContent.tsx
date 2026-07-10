import Link from "next/link";
import {
  Building2,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Store,
  User,
} from "lucide-react";
import { ApplicationReviewActions } from "@/components/admin/ApplicationReviewActions";
import { ApplicationStatusBadge } from "@/components/admin/ApplicationStatusBadge";
import { AdminFormCard } from "@/components/admin/admin-ui";
import {
  BUSINESS_TYPE_LABELS,
  formatApplicationLocation,
} from "@/lib/admin/application-labels";
import { storePath } from "@/lib/routes/store-routes";
import type { BusinessApplication } from "@/lib/types/business";

type ApplicationDetailContentProps = {
  application: BusinessApplication;
  reviewerEmail?: string | null;
  success?: string;
  error?: string;
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  );
}

export function ApplicationDetailContent({
  application,
  reviewerEmail,
  success,
  error,
}: ApplicationDetailContentProps) {
  const submittedAt = new Date(application.created_at).toLocaleString();
  const reviewedAt = application.reviewed_at
    ? new Date(application.reviewed_at).toLocaleString()
    : null;

  return (
    <div className="space-y-4 sm:space-y-6">
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

      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {application.business_name}
            </h1>
            <ApplicationStatusBadge status={application.status} />
          </div>
          <p className="text-sm text-gray-500">
            {storePath(application.business_slug)} ·{" "}
            {BUSINESS_TYPE_LABELS[application.business_type] ??
              application.business_type}
          </p>
          <p className="text-xs text-gray-400">Submitted {submittedAt}</p>
        </div>

        {application.status === "approved" && application.tenant_id ? (
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href={`/admin/dashboard/stores/${application.business_slug}/settings`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <Store size={16} />
              Manage store
            </Link>
            <a
              href={storePath(application.business_slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View storefront
              <ExternalLink size={14} />
            </a>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminFormCard
          title="Applicant"
          description="Contact details submitted with the application."
          icon={<User size={18} />}
        >
          <div className="space-y-4">
            <DetailRow label="Name" value={application.applicant_name} />
            <DetailRow
              label="Email"
              value={
                <a
                  href={`mailto:${application.applicant_email}`}
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Mail size={14} />
                  {application.applicant_email}
                </a>
              }
            />
            <DetailRow
              label="Phone"
              value={
                application.applicant_phone ? (
                  <a
                    href={`tel:${application.applicant_phone}`}
                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Phone size={14} />
                    {application.applicant_phone}
                  </a>
                ) : (
                  "Not provided"
                )
              }
            />
          </div>
        </AdminFormCard>

        <AdminFormCard
          title="Business"
          description="Store identity and category."
          icon={<Building2 size={18} />}
        >
          <div className="space-y-4">
            <DetailRow label="Business name" value={application.business_name} />
            <DetailRow
              label="Store slug"
              value={
                <code className="rounded bg-gray-100 px-2 py-0.5 text-xs">
                  {application.business_slug}
                </code>
              }
            />
            <DetailRow
              label="Category"
              value={
                BUSINESS_TYPE_LABELS[application.business_type] ??
                application.business_type
              }
            />
            <DetailRow
              label="Description"
              value={
                <p className="whitespace-pre-wrap leading-6 text-gray-700">
                  {application.business_description || "Not provided"}
                </p>
              }
            />
          </div>
        </AdminFormCard>

        <AdminFormCard
          title="Location"
          description="Business address from the application."
          icon={<MapPin size={18} />}
          className="lg:col-span-2"
        >
          <p className="text-sm leading-6 text-gray-700">
            {formatApplicationLocation(application)}
          </p>
        </AdminFormCard>

        {application.review_notes || reviewedAt ? (
          <AdminFormCard
            title="Review"
            description="Decision notes and review metadata."
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              {application.review_notes ? (
                <DetailRow
                  label="Notes"
                  value={
                    <p className="whitespace-pre-wrap leading-6 text-gray-700">
                      {application.review_notes}
                    </p>
                  }
                />
              ) : null}
              {reviewedAt ? (
                <DetailRow
                  label="Reviewed"
                  value={
                    reviewerEmail
                      ? `${reviewedAt} by ${reviewerEmail}`
                      : reviewedAt
                  }
                />
              ) : null}
            </div>
          </AdminFormCard>
        ) : null}
      </div>

      {application.status === "pending" ? (
        <AdminFormCard
          title="Review application"
          description="Approve to provision the store, or reject with a reason."
        >
          <ApplicationReviewActions applicationId={application.id} />
        </AdminFormCard>
      ) : null}
    </div>
  );
}
