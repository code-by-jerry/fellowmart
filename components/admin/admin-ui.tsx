import { cn } from "@/lib/utils";

export const ADMIN_SHELL_HEADER_CLASS = "h-14 shrink-0";

export const adminInputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary";

export const adminSelectClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";

export const adminTextareaClass =
  "w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary";

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
        "mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0 [&_a]:w-full sm:[&_a]:w-auto [&_button]:w-full sm:[&_button]:w-auto">{actions}</div> : null}
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
        "rounded-2xl border border-gray-200 bg-white shadow-sm",
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
  icon: React.ReactNode;
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-4 py-10 text-center text-sm text-gray-500 sm:px-8 sm:py-12",
        className,
      )}
    >
      <div className="mx-auto mb-3 text-gray-300">{icon}</div>
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
        "overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm",
        className,
      )}
    >
      {title ? (
        <div className="border-b border-gray-100 bg-gray-50/80 px-5 py-4">
          <div className="flex items-start gap-3">
            {icon ? (
              <span className="mt-0.5 text-gray-500">{icon}</span>
            ) : null}
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
              {description ? (
                <p className="mt-0.5 text-xs text-gray-500">{description}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      <div className="p-5 sm:p-6">{children}</div>
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
    <div
      className={cn(
        "grid grid-cols-1 gap-5 lg:grid-cols-2",
        className,
      )}
    >
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
    <div className={cn("space-y-1.5", span === 2 && "lg:col-span-2")}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {hint ? <p className="text-xs text-gray-400">{hint}</p> : null}
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
        "flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end",
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
  return (
    <div className={cn("w-full", className)}>{children}</div>
  );
}
