import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidateSiteSettings } from "@/lib/site-config-server";

/** Bust cached platform settings after admin saves branding in the dashboard. */
export async function POST() {
  revalidateSiteSettings();
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  return NextResponse.json({ ok: true });
}
