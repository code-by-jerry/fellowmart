import Link from "next/link";
import { redirect } from "next/navigation";
import { BusinessApplicationForm } from "@/components/business/BusinessApplicationForm";
import { createClient } from "@/utils/supabase/server";

export default async function ApplyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/apply");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Fellowmate for Business
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Apply to open your online store
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Tell us about your business. After approval, you will get your own admin
            panel and public storefront on Fellowmate.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <BusinessApplicationForm
            defaultValues={{
              applicant_name: profile?.full_name ?? undefined,
              applicant_email: profile?.email ?? user.email ?? undefined,
              applicant_phone: profile?.phone ?? undefined,
            }}
          />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already approved?{" "}
          <Link href="/business" className="font-medium text-primary hover:underline">
            Go to business dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
