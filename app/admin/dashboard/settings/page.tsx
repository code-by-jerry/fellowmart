'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { Save, Image, Globe, Palette, Type, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { SiteSettings } from '@/lib/site-config'
import { defaultSettings } from '@/lib/site-config'
import ImageUpload from '@/components/ui/ImageUpload'
import {
  AdminFormActions,
  AdminFormCard,
  AdminFormField,
  AdminFormGrid,
  AdminPage,
  AdminPageHeader,
  adminInputClass,
  adminTextareaClass,
} from '@/components/admin/admin-ui'

const supabase = createAdminClient()

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single()
      if (data) setSettings(data as SiteSettings)
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('site_settings')
      .update({
        app_name: settings.app_name,
        logo_url: settings.logo_url,
        logo_alt: settings.logo_alt,
        favicon_url: settings.favicon_url,
        theme_color: settings.theme_color,
        meta_title: settings.meta_title,
        meta_description: settings.meta_description,
        meta_keywords: settings.meta_keywords,
        announcement_text: settings.announcement_text,
        announcement_promo: settings.announcement_promo,
        footer_description: settings.footer_description,
        home_hero_eyebrow: settings.home_hero_eyebrow,
        home_hero_title: settings.home_hero_title,
        home_hero_description: settings.home_hero_description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)

    setSaving(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully.' })
      router.refresh()
    }
  }

  const set = (key: keyof SiteSettings, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }))

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        Loading settings...
      </div>
    )
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Site Settings"
        description="Configure your app identity, branding, storefront content, and SEO."
      />

      {message && (
        <div className={`mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
          message.type === 'success'
            ? 'border border-green-200 bg-green-50 text-green-700'
            : 'border border-red-200 bg-red-50 text-red-700'
        }`}>
          {message.type === 'success'
            ? <CheckCircle2 size={16} />
            : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <AdminFormCard
            icon={<Type size={16} />}
            title="App Identity"
            description="Name shown across the storefront and admin."
          >
            <AdminFormField label="App Name" hint="Appears in the navbar and browser tab">
              <input
                type="text"
                value={settings.app_name}
                onChange={(e) => set('app_name', e.target.value)}
                className={adminInputClass}
                placeholder="fellowmate"
              />
            </AdminFormField>
          </AdminFormCard>

          <AdminFormCard
            icon={<Palette size={16} />}
            title="Theme"
            description="Primary brand color for buttons and accents."
          >
            <AdminFormField label="Primary Color" hint="Default: black. White is always constant.">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="color"
                  value={settings.theme_color}
                  onChange={(e) => set('theme_color', e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded-lg border border-gray-300 p-1"
                />
                <input
                  type="text"
                  value={settings.theme_color}
                  onChange={(e) => set('theme_color', e.target.value)}
                  className={`${adminInputClass} max-w-[140px] font-mono uppercase`}
                  placeholder="#000000"
                  maxLength={7}
                />
                <button
                  type="button"
                  onClick={() => set('theme_color', '#000000')}
                  className="text-xs whitespace-nowrap text-gray-400 transition hover:text-black"
                >
                  Reset to black
                </button>
              </div>
            </AdminFormField>
          </AdminFormCard>

          <AdminFormCard
            icon={<Image size={16} />}
            title="Branding"
            description="Logo and favicon used across the site and admin."
            className="xl:col-span-2"
          >
            <AdminFormGrid>
              <AdminFormField label="Logo" hint="PNG, SVG, or WebP recommended" span={2}>
                <ImageUpload
                  folder="branding"
                  currentUrl={settings.logo_url ?? undefined}
                  onUpload={(url) => set('logo_url', url)}
                />
              </AdminFormField>
              <AdminFormField label="Logo Alt Text" hint="Describes the logo for accessibility">
                <input
                  type="text"
                  value={settings.logo_alt}
                  onChange={(e) => set('logo_alt', e.target.value)}
                  className={adminInputClass}
                  placeholder="fellowmate logo"
                />
              </AdminFormField>
              <AdminFormField label="Favicon" hint="Browser tab icon (ICO, PNG, or SVG)">
                <ImageUpload
                  folder="branding"
                  currentUrl={settings.favicon_url ?? undefined}
                  onUpload={(url) => set('favicon_url', url)}
                />
              </AdminFormField>
            </AdminFormGrid>
          </AdminFormCard>

          <AdminFormCard
            icon={<Type size={16} />}
            title="Global Content"
            description="Announcement bar and homepage hero copy."
            className="xl:col-span-2"
          >
            <AdminFormGrid>
              <AdminFormField label="Announcement Text" hint="Left side of the global announcement bar">
                <input type="text" value={settings.announcement_text} onChange={(e) => set('announcement_text', e.target.value)} className={adminInputClass} />
              </AdminFormField>
              <AdminFormField label="Announcement Promotion" hint="Centered promotion on larger screens">
                <input type="text" value={settings.announcement_promo} onChange={(e) => set('announcement_promo', e.target.value)} className={adminInputClass} />
              </AdminFormField>
              <AdminFormField label="Homepage Hero Eyebrow">
                <input type="text" value={settings.home_hero_eyebrow} onChange={(e) => set('home_hero_eyebrow', e.target.value)} className={adminInputClass} />
              </AdminFormField>
              <AdminFormField label="Homepage Hero Title">
                <input type="text" value={settings.home_hero_title} onChange={(e) => set('home_hero_title', e.target.value)} className={adminInputClass} />
              </AdminFormField>
              <AdminFormField label="Homepage Hero Description" span={2}>
                <textarea value={settings.home_hero_description} onChange={(e) => set('home_hero_description', e.target.value)} className={adminTextareaClass} rows={2} />
              </AdminFormField>
              <AdminFormField label="Footer Description" span={2}>
                <textarea value={settings.footer_description} onChange={(e) => set('footer_description', e.target.value)} className={adminTextareaClass} rows={2} />
              </AdminFormField>
            </AdminFormGrid>
          </AdminFormCard>

          <AdminFormCard
            icon={<Globe size={16} />}
            title="SEO"
            description="Search engine metadata for the storefront."
            className="xl:col-span-2"
          >
            <AdminFormGrid>
              <AdminFormField label="Meta Title" hint="Default page title shown in search results" span={2}>
                <input
                  type="text"
                  value={settings.meta_title}
                  onChange={(e) => set('meta_title', e.target.value)}
                  className={adminInputClass}
                  placeholder="fellowmate — Commerce for Local Businesses"
                />
                <CharCount value={settings.meta_title} max={60} />
              </AdminFormField>
              <AdminFormField label="Meta Description" hint="Short description for search engines" span={2}>
                <textarea
                  value={settings.meta_description}
                  onChange={(e) => set('meta_description', e.target.value)}
                  className={adminTextareaClass}
                  rows={3}
                  placeholder="Discover and order from local stores near you."
                />
                <CharCount value={settings.meta_description} max={160} />
              </AdminFormField>
              <AdminFormField label="Keywords" hint="Comma-separated keywords" span={2}>
                <input
                  type="text"
                  value={settings.meta_keywords}
                  onChange={(e) => set('meta_keywords', e.target.value)}
                  className={adminInputClass}
                  placeholder="local store, ecommerce, fellowmate"
                />
              </AdminFormField>
            </AdminFormGrid>
          </AdminFormCard>
        </div>

        <AdminFormActions>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </AdminFormActions>
      </form>
    </AdminPage>
  )
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length
  const over = len > max
  return (
    <p className={`mt-1 text-xs ${over ? 'text-red-500' : 'text-gray-400'}`}>
      {len}/{max} characters{over ? ' — too long' : ''}
    </p>
  )
}
