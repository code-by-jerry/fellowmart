'use client'

import { Bell, Search } from 'lucide-react'

interface TopbarProps {
  title: string
}

export default function Topbar({ title }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      {/* Left: page title */}
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      {/* Right: search + notifications + avatar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500">
          <Search size={15} />
          <input
            className="bg-transparent outline-none w-40 placeholder:text-gray-400 text-gray-800 text-sm"
            placeholder="Search..."
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold select-none">
          A
        </div>
      </div>
    </header>
  )
}
