import { cn } from "@/lib/utils";

export const ADMIN_SHELL_HEADER_CLASS = "h-14 shrink-0";

/** Compact form controls — Shopify-like density */
export const adminInputClass =
  "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-[13px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-400";

export const adminSelectClass =
  "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-[13px] text-gray-900 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-400";

export const adminTextareaClass =
  "w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-[13px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-400";

export const adminBtnPrimaryClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-gray-900 px-3 text-[13px] font-medium text-white transition hover:bg-gray-800 disabled:opacity-60";

export const adminBtnSecondaryClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 text-[13px] font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60";

export const adminBtnDangerClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 text-[13px] font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60";

export const adminTableClass = "min-w-full table-auto text-[13px]";

export const adminThClass =
  "border-b border-gray-200 bg-[#f7f7f7] px-3 py-2 text-left text-[12px] font-semibold text-gray-600";

export const adminTdClass = "border-b border-gray-100 px-3 py-2.5 text-gray-700";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-0.5 max-w-3xl text-[13px] leading-5 text-gray-500">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

type AdminListHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function AdminListHeader({
  title,
  description,
  action,
}: AdminListHeaderProps) {
  return (
    <AdminPageHeader title={title} description={description} actions={action} />
  );
}

export function AdminPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-gray-200 bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminEmptyState({
  icon,
  message,
  className,
}: {
  icon?: React.ReactNode;
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-4 py-8 text-center text-[13px] text-gray-500 sm:px-6",
        className,
      )}
    >
      {icon ? <div className="mx-auto mb-2 text-gray-300">{icon}</div> : null}
      {message}
    </div>
  );
}

type AdminFormCardProps = {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function AdminFormCard({
  title,
  description,
  icon,
  children,
  className,
}: AdminFormCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-md border border-gray-200 bg-white",
        className,
      )}
    >
      {title ? (
        <div className="border-b border-gray-200 bg-[#fafafa] px-4 py-3">
          <div className="flex items-start gap-2.5">
            {icon ? (
              <span className="mt-0.5 text-gray-500">{icon}</span>
            ) : null}
            <div>
              <h2 className="text-[13px] font-semibold text-gray-900">{title}</h2>
              {description ? (
                <p className="mt-0.5 text-[12px] text-gray-500">{description}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function AdminFormGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-3.5 lg:grid-cols-2", className)}>
      {children}
    </div>
  );
}

export function AdminFormField({
  label,
  hint,
  required,
  span = 1,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  span?: 1 | 2;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1", span === 2 && "lg:col-span-2")}>
      <label className="block text-[12px] font-semibold text-gray-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {hint ? <p className="text-[11px] text-gray-400">{hint}</p> : null}
      {children}
    </div>
  );
}

export function AdminFormActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-gray-200 pt-3.5 sm:flex-row sm:items-center sm:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("w-full", className)}>{children}</div>;
}
