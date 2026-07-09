'use client'

import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'

interface QuickAction {
  label: string
  href: string
  desc: string
}

export function QuickActions({ actions, themeColor }: { actions: QuickAction[]; themeColor: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {actions.map(({ label, href, desc }) => (
        <QuickActionCard key={label} label={label} href={href} desc={desc} themeColor={themeColor} />
      ))}
    </div>
  )
}

function QuickActionCard({
  label,
  href,
  desc,
  themeColor,
}: QuickAction & { themeColor: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={href}
      className="group bg-white rounded-xl border p-5 flex items-start justify-between transition-all"
      style={{ borderColor: hovered ? themeColor : '#e5e7eb' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-500 mt-1">{desc}</p>
      </div>
      <ArrowUpRight
        size={18}
        className="mt-0.5 shrink-0 transition-colors"
        style={{ color: hovered ? themeColor : '#9ca3af' }}
      />
    </a>
  )
}
