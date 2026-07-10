import type { ApplicationStatus } from "@/lib/types/business";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/10",
  approved: "bg-green-50 text-green-700 ring-green-600/10",
  rejected: "bg-red-50 text-red-700 ring-red-600/10",
};

export function ApplicationStatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
