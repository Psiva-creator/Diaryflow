'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Milk, CreditCard, ShoppingCart,
  Package, BarChart3, Bell, Settings, ChevronLeft,
  X, Droplets, Moon, Sun, LogOut, LibraryBig, type LucideIcon
} from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { logout } from '@/app/actions/auth'

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'       },
  { href: '/farmers',     icon: Users,            label: 'Farmers'         },
  { href: '/collection',  icon: Milk,             label: 'Milk Collection' },
  { href: '/payments',    icon: CreditCard,       label: 'Payments'        },
  { href: '/library',     icon: LibraryBig,       label: 'Receipt Library' },
  { href: '/customers',   icon: ShoppingCart,     label: 'Customers'       },
  { href: '/inventory',   icon: Package,          label: 'Inventory'       },
  { href: '/reports',     icon: BarChart3,        label: 'Reports'         },
  { href: '/notifications', icon: Bell,           label: 'Notifications'   },
  { href: '/settings',    icon: Settings,         label: 'Settings'        },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

interface SidebarContentProps {
  collapsed: boolean
  onMobileClose: () => void
  pathname: string
  theme: string
  toggleTheme: () => void
  user: { name: string, role: string, avatar: string }
  unreadNotifs: number
}

const SidebarContent = ({ collapsed, onMobileClose, pathname, theme, toggleTheme, user, unreadNotifs, logoutAction }: SidebarContentProps & { logoutAction: () => void }) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className={`flex items-center gap-3 px-4 py-5 border-b border-[var(--color-border)] ${collapsed ? 'justify-center' : ''}`}>
      <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
        <Droplets className="w-5 h-5 text-white" />
      </div>
      {!collapsed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
          <p className="font-bold text-base text-[var(--color-text)] leading-tight">DairyFlow</p>
          <p className="text-[10px] text-[var(--color-muted)] font-medium tracking-wide uppercase">Management</p>
        </motion.div>
      )}
    </div>

    {/* Nav */}
    <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            onClick={onMobileClose}
            className={`sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium relative group ${active ? 'active' : 'text-[var(--color-muted)]'}`}
          >
            <div className="relative flex-shrink-0">
              <Icon className="w-5 h-5" />
              {label === 'Notifications' && unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </div>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate">
                {label}
              </motion.span>
            )}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                {label}
              </div>
            )}
          </Link>
        )
      })}
    </nav>

    {/* Bottom area */}
    <div className="border-t border-[var(--color-border)] p-3 space-y-2">
      <button
        onClick={toggleTheme}
        className={`sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-muted)] ${collapsed ? 'justify-center' : ''}`}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
      </button>

      {!collapsed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)] truncate">{user.name}</p>
            <p className="text-xs text-[var(--color-muted)] capitalize">{user.role}</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="text-[var(--color-muted)] hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      )}
    </div>
  </div>
)

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const { theme, toggleTheme, user, unreadNotifs } = useApp()

  const sidebarContent = (
    <SidebarContent
      collapsed={collapsed}
      onMobileClose={onMobileClose}
      pathname={pathname}
      theme={theme}
      toggleTheme={toggleTheme}
      user={user}
      unreadNotifs={unreadNotifs}
      logoutAction={logout}
    />
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)] h-screen sticky top-0 overflow-hidden flex-shrink-0 z-30"
      >
        {sidebarContent}
        <button
          onClick={onToggle}
          className="absolute top-5 right-0 translate-x-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-700 border border-[var(--color-border)] flex items-center justify-center shadow-md hover:shadow-lg transition-all z-10"
        >
          <ChevronLeft className={`w-3.5 h-3.5 text-[var(--color-muted)] transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] z-50 md:hidden overflow-y-auto"
            >
              <div className="absolute top-3 right-3">
                <button onClick={onMobileClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <X className="w-4 h-4 text-[var(--color-muted)]" />
                </button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
