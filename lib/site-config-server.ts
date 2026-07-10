import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'
import { defaultSettings, type SiteSettings } from './site-config'

async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error || !data) return defaultSettings
    return { ...defaultSettings, ...data } as SiteSettings
  } catch {
    return defaultSettings
  }
}

export const getSiteSettings = cache(fetchSiteSettings)
