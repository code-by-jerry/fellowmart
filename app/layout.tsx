import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import { buildMetadata, buildViewport } from '@/lib/site-config'
import { getSiteSettings } from '@/lib/site-config-server'
import type { Viewport } from 'next'
import { SiteSettingsProvider } from '@/components/SiteSettingsProvider'
import { themeCssVars } from '@/lib/utils/color'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Platform landing / global metadata from site_settings (not per-store)
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata(settings)
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await getSiteSettings()
  return buildViewport(settings)
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      style={themeCssVars(settings.theme_color)}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SiteSettingsProvider settings={settings}>
          {children}
        </SiteSettingsProvider>
      </body>
    </html>
  )
}
