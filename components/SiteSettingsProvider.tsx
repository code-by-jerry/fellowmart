'use client'

import { createContext, useContext } from 'react'
import type { SiteSettings } from '@/lib/site-config'

const SiteSettingsContext = createContext<SiteSettings | null>(null)

export function SiteSettingsProvider({ settings, children }: { settings: SiteSettings; children: React.ReactNode }) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
  }
  return context
}
