import { redirect } from "next/navigation";

export default function AdminRegisterPage() {
  redirect("/admin/login?error=Admin registration is disabled.");
}
