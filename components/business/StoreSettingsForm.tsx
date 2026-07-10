"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Users } from "lucide-react";
import {
  adminBtnPrimaryClass,
  adminBtnSecondaryClass,
  adminInputClass,
  adminSelectClass,
  adminTextareaClass,
  AdminPanel,
} from "@/components/admin/admin-ui";
import ImageUpload from "@/components/ui/ImageUpload";
import { BUSINESS_TYPES } from "@/lib/types/business";
import { STORE_CURRENCIES } from "@/lib/currency/currencies";
import { storePath } from "@/lib/routes/store-routes";

const TYPE_LABELS = Object.fromEntries(
  BUSINESS_TYPES.map((type) => [type.value, type.label]),
);

export type StoreSettingsFormValues = {
  name: string;
  slug: string;
  business_type: string | null;
  onboarding_status: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  business_description: string | null;
  currency: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  announcement_text: string | null;
  announcement_promo: string | null;
  footer_description: string | null;
  home_hero_eyebrow: string | null;
  home_hero_title: string | null;
  home_hero_description: string | null;
};

type TeamRequest = {
  id: string;
  member_email: string;
  requested_role: string;
  status: string;
  created_at: string;
};

type StoreSettingsFormProps = {
  tenantSlug: string;
  initial: StoreSettingsFormValues;
  teamRequests: TeamRequest[];
};

export function StoreSettingsForm({
  tenantSlug,
  initial,
  teamRequests,
}: StoreSettingsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState(initial.logo_url ?? "");
  const [faviconUrl, setFaviconUrl] = useState(initial.favicon_url ?? "");
  const [primaryColor, setPrimaryColor] = useState(
    initial.primary_color ?? "#0f172a",
  );
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("staff");
  const [memberNotes, setMemberNotes] = useState("");

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const form = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/business/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_slug: tenantSlug,
          name: form.get("name"),
          business_description: form.get("business_description"),
          contact_email: form.get("contact_email"),
          contact_phone: form.get("contact_phone"),
          currency: form.get("currency"),
          logo_url: logoUrl,
          favicon_url: faviconUrl,
          primary_color: primaryColor,
          meta_title: form.get("meta_title"),
          meta_description: form.get("meta_description"),
          meta_keywords: form.get("meta_keywords"),
          announcement_text: form.get("announcement_text"),
          announcement_promo: form.get("announcement_promo"),
          footer_description: form.get("footer_description"),
          home_hero_eyebrow: form.get("home_hero_eyebrow"),
          home_hero_title: form.get("home_hero_title"),
          home_hero_description: form.get("home_hero_description"),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not save settings");
        return;
      }
      setMessage("Store settings saved. Your storefront updates immediately.");
      router.refresh();
    } catch {
      setError("Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const requestTeamMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!memberEmail.trim()) return;

    setRequesting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/business/team/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_slug: tenantSlug,
          member_email: memberEmail,
          requested_role: memberRole,
          notes: memberNotes,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Could not submit request");
        return;
      }
      setMemberEmail("");
      setMemberNotes("");
      setMessage("Team access request sent. Fellowmate will review and add the member.");
      router.refresh();
    } catch {
      setError("Could not submit request");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-4">
      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={saveSettings} className="space-y-4">
        <AdminPanel>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-[13px] font-medium text-gray-900">Store profile</p>
              <p className="mt-0.5 text-[12px] text-gray-500">
                Name, contact, and public store URL for your business.
              </p>
            </div>
            <Link
              href={storePath(initial.slug)}
              target="_blank"
              className={`${adminBtnSecondaryClass} gap-1.5`}
            >
              Preview store
              <ExternalLink size={13} />
            </Link>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-[12px] font-medium text-gray-600">Store name</span>
              <input
                name="name"
                required
                defaultValue={initial.name}
                className={adminInputClass}
              />
            </label>

            <div className="space-y-1.5">
              <span className="text-[12px] font-medium text-gray-600">Store URL</span>
              <input
                readOnly
                value={storePath(initial.slug)}
                className={`${adminInputClass} bg-gray-50 text-gray-500`}
              />
              <p className="text-[11px] text-gray-400">
                URL is assigned at onboarding. Contact support to change it.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[12px] font-medium text-gray-600">Business type</span>
              <input
                readOnly
                value={
                  TYPE_LABELS[initial.business_type as keyof typeof TYPE_LABELS] ??
                  initial.business_type ??
                  "—"
                }
                className={`${adminInputClass} bg-gray-50 text-gray-500`}
              />
            </div>

            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-gray-600">Contact email</span>
              <input
                name="contact_email"
                type="email"
                defaultValue={initial.contact_email ?? ""}
                className={adminInputClass}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-gray-600">Contact phone</span>
              <input
                name="contact_phone"
                defaultValue={initial.contact_phone ?? ""}
                className={adminInputClass}
              />
            </label>

            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-[12px] font-medium text-gray-600">Description</span>
              <textarea
                name="business_description"
                rows={3}
                defaultValue={initial.business_description ?? ""}
                className={adminTextareaClass}
                placeholder="Short description of your store"
              />
            </label>
          </div>
        </AdminPanel>

        <AdminPanel>
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-[13px] font-medium text-gray-900">Store currency</p>
            <p className="mt-0.5 text-[12px] text-gray-500">
              Global display currency for your storefront. Catalog prices are stored in INR and
              converted live using public exchange rates (refreshed about every 6 hours).
            </p>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-gray-600">Display currency</span>
              <select
                name="currency"
                defaultValue={initial.currency ?? "INR"}
                className={adminSelectClass}
              >
                {STORE_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.label} ({c.symbol})
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-[12px] text-gray-600 sm:self-end">
              Supported: INR, USD, EUR, AED. Changing this updates all storefront prices
              immediately after save.
            </div>
          </div>
        </AdminPanel>

        <AdminPanel>
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-[13px] font-medium text-gray-900">Branding</p>
            <p className="mt-0.5 text-[12px] text-gray-500">
              Logo, favicon, and theme color for your storefront only — not the Fellowmate landing page.
            </p>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <div>
              <ImageUpload
                label="Logo"
                folder={`stores/${tenantSlug}/branding`}
                currentUrl={logoUrl || undefined}
                onUpload={setLogoUrl}
              />
            </div>
            <div>
              <ImageUpload
                label="Favicon"
                folder={`stores/${tenantSlug}/branding`}
                currentUrl={faviconUrl || undefined}
                onUpload={setFaviconUrl}
              />
            </div>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-[12px] font-medium text-gray-600">Theme color</span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-md border border-gray-300 p-1"
                />
                <input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className={`${adminInputClass} max-w-[140px] font-mono`}
                />
              </div>
            </label>
          </div>
        </AdminPanel>

        <AdminPanel>
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-[13px] font-medium text-gray-900">Homepage & pages</p>
            <p className="mt-0.5 text-[12px] text-gray-500">
              Hero copy, announcements, and footer for your public store.
            </p>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-gray-600">Hero eyebrow</span>
              <input
                name="home_hero_eyebrow"
                defaultValue={initial.home_hero_eyebrow ?? ""}
                className={adminInputClass}
                placeholder="New Collection"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-gray-600">Hero title</span>
              <input
                name="home_hero_title"
                defaultValue={initial.home_hero_title ?? ""}
                className={adminInputClass}
                placeholder={`Welcome to ${initial.name}`}
              />
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-[12px] font-medium text-gray-600">Hero description</span>
              <textarea
                name="home_hero_description"
                rows={3}
                defaultValue={initial.home_hero_description ?? ""}
                className={adminTextareaClass}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-gray-600">Announcement</span>
              <input
                name="announcement_text"
                defaultValue={initial.announcement_text ?? ""}
                className={adminInputClass}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12px] font-medium text-gray-600">Promo line</span>
              <input
                name="announcement_promo"
                defaultValue={initial.announcement_promo ?? ""}
                className={adminInputClass}
              />
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-[12px] font-medium text-gray-600">Footer description</span>
              <textarea
                name="footer_description"
                rows={2}
                defaultValue={initial.footer_description ?? ""}
                className={adminTextareaClass}
              />
            </label>
          </div>
        </AdminPanel>

        <AdminPanel>
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-[13px] font-medium text-gray-900">SEO</p>
            <p className="mt-0.5 text-[12px] text-gray-500">
              Search title and description for your store pages.
            </p>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-[12px] font-medium text-gray-600">Meta title</span>
              <input
                name="meta_title"
                defaultValue={initial.meta_title ?? ""}
                className={adminInputClass}
                placeholder={`${initial.name} — Shop online`}
              />
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-[12px] font-medium text-gray-600">Meta description</span>
              <textarea
                name="meta_description"
                rows={3}
                defaultValue={initial.meta_description ?? ""}
                className={adminTextareaClass}
              />
            </label>
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-[12px] font-medium text-gray-600">Keywords</span>
              <input
                name="meta_keywords"
                defaultValue={initial.meta_keywords ?? ""}
                className={adminInputClass}
                placeholder="grocery, local store, delivery"
              />
            </label>
          </div>
        </AdminPanel>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className={adminBtnPrimaryClass}>
            {saving ? "Saving…" : "Save store settings"}
          </button>
        </div>
      </form>

      <AdminPanel>
        <div className="flex items-start gap-2 border-b border-gray-100 px-4 py-3">
          <Users size={16} className="mt-0.5 text-gray-400" />
          <div>
            <p className="text-[13px] font-medium text-gray-900">Team access</p>
            <p className="mt-0.5 text-[12px] text-gray-500">
              Request admin or staff access for teammates. Fellowmate reviews and adds members — you cannot add them directly yet.
            </p>
          </div>
        </div>

        {teamRequests.length > 0 ? (
          <div className="overflow-x-auto border-b border-gray-100">
            <table className="min-w-full text-[13px]">
              <thead className="bg-[#f7f7f7] text-left text-[12px] font-semibold text-gray-600">
                <tr>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teamRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-4 py-2.5 text-gray-900">{req.member_email}</td>
                    <td className="px-4 py-2.5 capitalize text-gray-600">{req.requested_role}</td>
                    <td className="px-4 py-2.5 capitalize text-gray-600">{req.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <form onSubmit={requestTeamMember} className="grid gap-3 p-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-[12px] font-medium text-gray-600">Member email</span>
            <input
              type="email"
              required
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className={adminInputClass}
              placeholder="teammate@example.com"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[12px] font-medium text-gray-600">Requested role</span>
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className={adminSelectClass}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-[12px] font-medium text-gray-600">Note (optional)</span>
            <input
              value={memberNotes}
              onChange={(e) => setMemberNotes(e.target.value)}
              className={adminInputClass}
              placeholder="Why they need access"
            />
          </label>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={requesting} className={adminBtnSecondaryClass}>
              {requesting ? "Sending…" : "Request team member"}
            </button>
          </div>
        </form>
      </AdminPanel>
    </div>
  );
}
