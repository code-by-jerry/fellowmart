import { Check } from "lucide-react";
import type { OrderTrackingStep } from "@/lib/orders/tracking";
import { cn } from "@/lib/utils";

type OrderTrackingTimelineProps = {
  steps: OrderTrackingStep[];
};

function formatTimestamp(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrderTrackingTimeline({ steps }: OrderTrackingTimelineProps) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const timestamp = formatTimestamp(step.timestamp);

        return (
          <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast ? (
              <span
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px",
                  step.completed ? "bg-emerald-200" : "bg-gray-200",
                )}
              />
            ) : null}
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                step.completed
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : step.current
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 bg-white text-gray-300",
              )}
            >
              {step.completed ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-current" />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={cn(
                  "text-sm font-semibold",
                  step.completed || step.current
                    ? "text-gray-900"
                    : "text-gray-400",
                )}
              >
                {step.label}
              </p>
              <p className="mt-1 text-sm text-gray-500">{step.description}</p>
              {timestamp ? (
                <p className="mt-1 text-xs text-gray-400">{timestamp}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
