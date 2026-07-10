import { formatRelativeTime, type ActivityLog } from "@/lib/activity/types";
import { AdminPanel } from "@/components/admin/admin-ui";

type ActivityLogListProps = {
  logs: ActivityLog[];
  emptyMessage?: string;
};

export function ActivityLogList({
  logs,
  emptyMessage = "No activity yet.",
}: ActivityLogListProps) {
  return (
    <AdminPanel>
      {logs.length === 0 ? (
        <p className="px-4 py-10 text-center text-[13px] text-gray-400">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {logs.map((log) => (
            <li key={log.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-gray-900">{log.summary}</p>
                <p className="mt-0.5 text-[12px] text-gray-500">
                  {log.actor_email ?? "System"}
                  {log.action ? (
                    <>
                      <span className="mx-1.5 text-gray-300">·</span>
                      <span className="font-mono text-[11px] text-gray-400">{log.action}</span>
                    </>
                  ) : null}
                </p>
              </div>
              <time className="shrink-0 text-[11px] text-gray-400">
                {formatRelativeTime(log.created_at)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </AdminPanel>
  );
}
