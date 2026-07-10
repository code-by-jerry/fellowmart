import { adminInputClass } from "@/components/admin/admin-ui";

export function ApplicationReviewActions({
  applicationId,
}: {
  applicationId: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <form
        action="/api/admin/applications/approve"
        method="post"
        className="space-y-3 rounded-xl border border-green-200 bg-green-50/50 p-4"
      >
        <input type="hidden" name="application_id" value={applicationId} />
        <div>
          <p className="text-sm font-semibold text-gray-900">Approve application</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Provisions the store and invites the applicant as owner.
          </p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-gray-700">
            Approval notes (optional)
          </span>
          <input
            name="review_notes"
            className={adminInputClass}
            placeholder="Approved for starter plan"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Approve & provision store
        </button>
      </form>

      <form
        action="/api/admin/applications/reject"
        method="post"
        className="space-y-3 rounded-xl border border-red-200 bg-red-50/50 p-4"
      >
        <input type="hidden" name="application_id" value={applicationId} />
        <div>
          <p className="text-sm font-semibold text-gray-900">Reject application</p>
          <p className="mt-0.5 text-xs text-gray-500">
            The applicant will not receive a store on the platform.
          </p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-gray-700">
            Rejection reason <span className="text-red-500">*</span>
          </span>
          <input
            name="review_notes"
            required
            className={adminInputClass}
            placeholder="Missing business details"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
        >
          Reject application
        </button>
      </form>
    </div>
  );
}
