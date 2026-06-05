'use client'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  sub?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  trend?: number
  delay?: number
}

export default function StatCard({ icon: Icon, label, value, sub, color = 'blue', trend, delay = 0 }: StatCardProps) {
  const colors = {
    blue:   { bg: 'from-blue-500 to-sky-400',   ring: 'bg-blue-50 dark:bg-blue-950/30'  },
    green:  { bg: 'from-green-500 to-emerald-400', ring: 'bg-green-50 dark:bg-green-950/30' },
    purple: { bg: 'from-purple-500 to-violet-400', ring: 'bg-purple-50 dark:bg-purple-950/30' },
    orange: { bg: 'from-orange-500 to-amber-400',  ring: 'bg-orange-50 dark:bg-orange-950/30' },
    red:    { bg: 'from-red-500 to-rose-400',     ring: 'bg-red-50 dark:bg-red-950/30'   },
  }
  const c = colors[color] || colors.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="stat-card"
    >
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-[var(--color-text)] leading-tight">{value}</p>
        <p className="text-sm font-medium text-[var(--color-muted)] mt-0.5">{label}</p>
        {sub && <p className="text-xs text-[var(--color-muted)] mt-1">{sub}</p>}
      </div>
    </motion.div>
  )
}
