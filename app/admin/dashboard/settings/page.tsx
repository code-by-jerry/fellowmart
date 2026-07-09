'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Image, Globe, Palette, Type, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { SiteSettings } from '@/lib/site-config'
import { defaultSettings } from '@/lib/site-config'
import ImageUpload from '@/components/ui/ImageUpload'

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
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Loading settings...
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure your app identity, branding, and SEO.</p>
      </div>

      {/* Status message */}
      {message && (
        <div className={`flex items-center gap-2 text-sm rounded-lg px-4 py-3 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success'
            ? <CheckCircle2 size={16} />
            : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* ── Identity ─────────────────────────────────────────── */}
      <Section icon={<Type size={16} />} title="App Identity">
        <Field label="App Name" hint="Appears in the navbar and browser tab">
          <input
            type="text"
            value={settings.app_name}
            onChange={(e) => set('app_name', e.target.value)}
            className={inputClass}
            placeholder="fellowmate"
          />
        </Field>
      </Section>

      <Section icon={<Type size={16} />} title="Global Content">
        <Field label="Announcement Text" hint="Left side of the global announcement bar">
          <input type="text" value={settings.announcement_text} onChange={(e) => set('announcement_text', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Announcement Promotion" hint="Centered promotion shown on larger screens">
          <input type="text" value={settings.announcement_promo} onChange={(e) => set('announcement_promo', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Homepage Hero Eyebrow">
          <input type="text" value={settings.home_hero_eyebrow} onChange={(e) => set('home_hero_eyebrow', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Homepage Hero Title">
          <input type="text" value={settings.home_hero_title} onChange={(e) => set('home_hero_title', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Homepage Hero Description">
          <textarea value={settings.home_hero_description} onChange={(e) => set('home_hero_description', e.target.value)} className={`${inputClass} resize-none`} rows={2} />
        </Field>
        <Field label="Footer Description">
          <textarea value={settings.footer_description} onChange={(e) => set('footer_description', e.target.value)} className={`${inputClass} resize-none`} rows={2} />
        </Field>
      </Section>

      {/* ── Branding ─────────────────────────────────────────── */}
      <Section icon={<Image size={16} />} title="Branding">
        <Field label="Logo" hint="Upload your logo (PNG, SVG, or WebP recommended)">
          <ImageUpload
            folder="branding"
            currentUrl={settings.logo_url ?? undefined}
            onUpload={(url) => set('logo_url', url)}
          />
        </Field>
        <Field label="Logo Alt Text" hint="Describes the logo for accessibility">
          <input
            type="text"
            value={settings.logo_alt}
            onChange={(e) => set('logo_alt', e.target.value)}
            className={inputClass}
            placeholder="fellowmate logo"
          />
        </Field>
        <Field label="Favicon" hint="Small icon shown in the browser tab (ICO, PNG, or SVG)">
          <ImageUpload
            folder="branding"
            currentUrl={settings.favicon_url ?? undefined}
            onUpload={(url) => set('favicon_url', url)}
          />
        </Field>
      </Section>

      {/* ── Theme ────────────────────────────────────────────── */}
      <Section icon={<Palette size={16} />} title="Theme">
        <Field label="Primary Color" hint="Default: black. White is always constant.">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.theme_color}
              onChange={(e) => set('theme_color', e.target.value)}
              className="h-10 w-16 rounded-lg border border-gray-300 cursor-pointer p-1"
            />
            <input
              type="text"
              value={settings.theme_color}
              onChange={(e) => set('theme_color', e.target.value)}
              className={`${inputClass} font-mono uppercase`}
              placeholder="#000000"
              maxLength={7}
            />
            <button
              type="button"
              onClick={() => set('theme_color', '#000000')}
              className="text-xs text-gray-400 hover:text-black transition-colors whitespace-nowrap"
            >
              Reset to black
            </button>
          </div>
        </Field>
      </Section>

      {/* ── SEO ──────────────────────────────────────────────── */}
      <Section icon={<Globe size={16} />} title="SEO">
        <Field label="Meta Title" hint="Default page title shown in search results">
          <input
            type="text"
            value={settings.meta_title}
            onChange={(e) => set('meta_title', e.target.value)}
            className={inputClass}
            placeholder="fellowmate — Commerce for Local Businesses"
          />
          <CharCount value={settings.meta_title} max={60} />
        </Field>
        <Field label="Meta Description" hint="Short description for search engines">
          <textarea
            value={settings.meta_description}
            onChange={(e) => set('meta_description', e.target.value)}
            className={`${inputClass} resize-none`}
            rows={3}
            placeholder="Discover and order from local stores near you."
          />
          <CharCount value={settings.meta_description} max={160} />
        </Field>
        <Field label="Keywords" hint="Comma-separated keywords">
          <input
            type="text"
            value={settings.meta_keywords}
            onChange={(e) => set('meta_keywords', e.target.value)}
            className={inputClass}
            placeholder="local store, ecommerce, fellowmate"
          />
        </Field>
      </Section>

      {/* Save */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}

// ─── Helper components ────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-gray-500">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  )
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length
  const over = len > max
  return (
    <p className={`text-xs mt-1 ${over ? 'text-red-500' : 'text-gray-400'}`}>
      {len}/{max} characters{over ? ' — too long' : ''}
    </p>
  )
}

const inputClass =
  'w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-gray-400'
