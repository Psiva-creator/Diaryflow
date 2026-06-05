'use client'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { Bell, CreditCard, Milk, Settings, CheckCircle, AlertCircle } from 'lucide-react'

const iconMap: Record<string, any> = {
  payment:     CreditCard,
  collection:  Milk,
  maintenance: Settings,
}

import { markNotifAsRead as markNotifAsReadAction } from '@/app/actions/notifications'

export default function NotificationsPage() {
  const { notifications, unreadNotifs } = useApp()

  const handleMarkAsRead = async (n: any) => {
    await markNotifAsReadAction(n._dbId)
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <h1 className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600" /> Notifications
          {unreadNotifs > 0 && (
            <span className="ml-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadNotifs}
            </span>
          )}
        </h1>
        <p>System alerts, payment reminders, and collection updates</p>
      </div>

      <div className="max-w-2xl space-y-3">
        {notifications.length === 0 && (
          <div className="text-center py-20 text-[var(--color-muted)]">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No notifications yet</p>
          </div>
        )}
        {notifications.map((n, i) => {
          const Icon = iconMap[n.type] || AlertCircle
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => !n.read && handleMarkAsRead(n)}
              className={`section-card flex items-start gap-4 cursor-pointer transition-colors ${!n.read ? 'border-l-4 border-l-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.read ? 'gradient-primary' : 'bg-slate-100 dark:bg-slate-700'}`}>
                <Icon className={`w-5 h-5 ${!n.read ? 'text-white' : 'text-[var(--color-muted)]'}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${!n.read ? 'font-semibold text-[var(--color-text)]' : 'text-[var(--color-muted)]'}`}>{n.msg}</p>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">{n.time}</p>
              </div>
              {n.read && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />}
              {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
