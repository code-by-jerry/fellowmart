import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ApplicationDetailContent } from "@/components/admin/ApplicationDetailContent";
import { AdminPage } from "@/components/admin/admin-ui";
import { getAdminDataClient } from "@/lib/admin/auth";
import type { BusinessApplication } from "@/lib/types/business";

type ApplicationDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: ApplicationDetailPageProps) {
  const { id } = await params;
  const { success, error } = await searchParams;
  const db = await getAdminDataClient();

  const { data: application, error: applicationError } = await db
    .from("business_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (applicationError || !application) {
    notFound();
  }

  let reviewerEmail: string | null = null;
  if (application.reviewed_by) {
    const { data: reviewer } = await db
      .from("profiles")
      .select("email")
      .eq("id", application.reviewed_by)
      .maybeSingle();
    reviewerEmail = reviewer?.email ?? null;
  }

  return (
    <AdminPage>
      <Link
        href="/admin/dashboard/applications"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to applications
      </Link>

      <ApplicationDetailContent
        application={application as BusinessApplication}
        reviewerEmail={reviewerEmail}
        success={success}
        error={error}
      />
    </AdminPage>
  );
}
