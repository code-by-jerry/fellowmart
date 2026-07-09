import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-server";
import { redirectTo } from "@/lib/route-utils";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const sku = String(form.get("sku") ?? "").trim();
    const price = Number(form.get("price") ?? 0);
    const description = String(form.get("description") ?? "").trim() || null;
    const imageUrl = String(form.get("image_url") ?? "").trim() || null;

    const supabase = await createAdminClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return redirectTo(request, "/admin/login");

    if (!name) {
      return new NextResponse(JSON.stringify({ error: "Product name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { error: insertError } = await supabase.from("products").insert({
      name,
      slug: slugify(name),
      sku: sku || null,
      price,
      description,
      image_url: imageUrl,
      is_active: true,
    });

    if (insertError) {
      return new NextResponse(
        JSON.stringify({ error: insertError.message ?? "Could not create product" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return redirectTo(request, "/admin/dashboard/products");
  } catch (err: any) {
    console.error("Error in /api/admin/products/create:", err?.message ?? err);
    return new NextResponse(
      JSON.stringify({ error: err?.message ?? "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
