import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  active: "bg-sky-50 text-sky-800 ring-sky-200",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  paused: "bg-slate-100 text-slate-600 ring-slate-200",
  trial: "bg-violet-50 text-violet-800 ring-violet-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  expired: "bg-slate-100 text-slate-500 ring-slate-200",
};

export function StoreStatusBadge({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const key = value.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset",
        styles[key] ?? "bg-slate-100 text-slate-600 ring-slate-200",
        className,
      )}
    >
      {value}
    </span>
  );
}
