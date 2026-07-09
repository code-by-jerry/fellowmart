import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import { buildMetadata, buildViewport } from '@/lib/site-config'
import { getSiteSettings } from '@/lib/site-config-server'
import type { Viewport } from 'next'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Dynamic metadata pulled from Supabase site_settings table
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata(settings)
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await getSiteSettings()
  return buildViewport(settings)
}

import { SiteSettingsProvider } from '@/components/SiteSettingsProvider'

/** Convert a hex color to relative luminance (0–1) for contrast calculation */
function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings()

  // Use white text on dark backgrounds, black text on light backgrounds
  const fgColor = hexLuminance(settings.theme_color) > 0.35 ? '#000000' : '#ffffff'


  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      style={{
        '--primary': settings.theme_color,
        '--primary-foreground': fgColor,
        '--ring': settings.theme_color,
        '--color-primary': settings.theme_color,
        '--color-primary-foreground': fgColor,
        '--color-ring': settings.theme_color,
      } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SiteSettingsProvider settings={settings}>
          {children}
        </SiteSettingsProvider>
      </body>
    </html>
  )
}
