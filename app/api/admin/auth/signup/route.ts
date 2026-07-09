import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-server";
import { redirectTo } from "@/lib/route-utils";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const supabase = await createAdminClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: "admin" } },
    });

    if (error) {
      return redirectTo(request, "/admin/register?error=Could not create user");
    }

    return redirectTo(request, "/admin/dashboard");
  } catch (err: any) {
    console.error('Error in /api/admin/auth/signup:', err?.message ?? err);
    return new NextResponse(JSON.stringify({ error: err?.message ?? 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
