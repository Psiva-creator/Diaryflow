'use client'
import { useState, type ReactNode } from 'react'
import { AppProvider, type AppProviderProps } from '@/context/AppContext'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import AIChatbot from '@/components/ui/AIChatbot'

interface AppShellProps {
  children: ReactNode
  initialData: AppProviderProps['initialData']
}

export default function AppShell({ children, initialData }: AppShellProps) {
  const [collapsed, setCollapsed]     = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)

  return (
    <AppProvider initialData={initialData}>
      <div className="flex h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
          <AIChatbot />
        </div>
      </div>
    </AppProvider>
  )
}
