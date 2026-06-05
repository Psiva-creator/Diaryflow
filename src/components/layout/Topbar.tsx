'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, Search, Bell, RefreshCw } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import Link from 'next/link'

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { unreadNotifs, todayStr } = useApp()
  const [search, setSearch] = useState('')

  return (
    <header className="sticky top-0 z-20 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-4">
      {/* Mobile menu */}
      <button
        id="mobile-menu-btn"
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <Menu className="w-5 h-5 text-[var(--color-muted)]" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
        <input
          id="global-search"
          type="text"
          placeholder="Search farmers, collections..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-[var(--color-border)] rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Date */}
        <span className="hidden sm:block text-xs text-[var(--color-muted)] font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
          {new Date(todayStr).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
        </span>

        {/* Refresh */}
        <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
          <RefreshCw className="w-4 h-4 text-[var(--color-muted)] group-hover:rotate-180 transition-transform duration-500" />
        </button>

        {/* Notifications */}
        <Link href="/notifications" className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <Bell className="w-5 h-5 text-[var(--color-muted)]" />
          {unreadNotifs > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadNotifs}
            </motion.span>
          )}
        </Link>
      </div>
    </header>
  )
}
