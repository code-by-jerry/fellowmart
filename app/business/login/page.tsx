"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Store } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { SiteBrand } from "@/components/SiteBrand";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

const supabase = createClient();

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

function BusinessLoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/business";
  const settings = useSiteSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setLoading(true);
    setError("");

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", next);

    const { data, error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (signInError) {
      setError(signInError.message || "Google sign-in failed.");
      setLoading(false);
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="space-y-6 px-8 py-10">
          <div className="mb-2">
            <SiteBrand variant="login" subtitle="Business Portal" />
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3">
            <Store className="h-5 w-5 text-primary" />
            <p className="text-sm text-gray-600">
              Sign in to manage your stores, products, and orders.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">Business sign in</h2>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Use the Google account linked to your Fellowmate business.
            </p>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:opacity-60"
          >
            <GoogleIcon />
            {loading ? "Redirecting..." : "Continue with Google"}
            {!loading ? <ArrowRight size={16} /> : null}
          </button>
        </div>

        <div className="space-y-2 px-8 pb-6 text-center text-xs text-gray-400">
          <p>
            Shopping as a customer?{" "}
            <Link href="/login" className="underline transition-colors hover:text-primary">
              Customer sign in
            </Link>
          </p>
          <p>
            Platform operator?{" "}
            <Link
              href="/admin/login"
              className="underline transition-colors hover:text-primary"
            >
              Admin sign in
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} {settings.app_name}. All rights reserved.
      </p>
    </div>
  );
}

export default function BusinessLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        </div>
      }
    >
      <BusinessLoginForm />
    </Suspense>
  );
}
