import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Store not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          This store does not exist or is not available yet.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Back to marketplace
        </Link>
      </div>
    </div>
  );
}
