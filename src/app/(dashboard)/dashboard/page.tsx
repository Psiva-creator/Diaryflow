'use client'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import StatCard from '@/components/ui/StatCard'
import {
  Milk, Users, IndianRupee, AlertCircle, Droplets, TrendingUp, Clock, CheckCircle2
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#1d6fb8', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-[var(--color-text)] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === 'number' && p.name.includes('Revenue') ? `₹${p.value.toLocaleString()}` : `${p.value} L`}</strong></p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { totalMilkToday, revenueToday, activeFarmers, pendingPayments, last7Days, fatDist, todayCollections, collections } = useApp()

  const recentActivity = [
    ...todayCollections.slice(-5).map(c => ({
      id: c.id, icon: Milk, color: 'blue',
      msg: `${c.farmerName} – ${c.qty}L (${c.shift})`,
      sub: `Fat: ${c.fat}% | Water: ${c.water}% | ₹${c.amount}`,
      time: c.shift === 'morning' ? '7:00 AM' : '5:00 PM',
      badge: c.status,
    })),
  ].slice(0, 6)

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header */}
      <div className="page-header">
        <h1 className="flex items-center gap-2">
          <Droplets className="w-6 h-6 text-blue-600" /> Dashboard
        </h1>
        <p>Good morning! Here&apos;s your dairy overview for today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Milk}         label="Milk Collected Today" value={`${totalMilkToday.toFixed(1)} L`}          color="blue"   trend={12}  delay={0}    sub="Both shifts combined" />
        <StatCard icon={Users}        label="Active Farmers"        value={activeFarmers}                              color="green"  trend={3}   delay={0.08} sub="Registered & active"  />
        <StatCard icon={IndianRupee}  label="Today's Revenue"       value={`₹${revenueToday.toLocaleString()}`}       color="purple" trend={8}   delay={0.16} sub="From milk collection"  />
        <StatCard icon={AlertCircle}  label="Pending Payments"      value={`₹${pendingPayments.toLocaleString()}`}    color="orange" trend={-5}  delay={0.24} sub="Needs settlement"      />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Area chart – 7-day collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="section-card lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-[var(--color-text)]">Milk Collection – Last 7 Days</h2>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">Morning & evening shifts</p>
            </div>
            <span className="badge-blue">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={last7Days} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradMorning" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1d6fb8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1d6fb8" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gradEvening" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} unit=" L" />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="morning" name="Morning" stroke="#1d6fb8" fill="url(#gradMorning)" strokeWidth={2} dot={{ r: 3 }} />
              <Area type="monotone" dataKey="evening" name="Evening" stroke="#22c55e" fill="url(#gradEvening)" strokeWidth={2} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart – Fat distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="section-card"
        >
          <h2 className="font-bold text-[var(--color-text)] mb-1">Fat % Distribution</h2>
          <p className="text-xs text-[var(--color-muted)] mb-4">Across all collections</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={fatDist} dataKey="count" nameKey="range" cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={3} label={({ range }: any) => range} labelLine={false}>
                {fatDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {fatDist.map((d, i) => (
              <div key={d.range} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-[var(--color-muted)]">{d.range}%</span>
                </div>
                <span className="font-semibold text-[var(--color-text)]">{d.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Revenue bar + Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="section-card"
        >
          <h2 className="font-bold text-[var(--color-text)] mb-1">Daily Revenue</h2>
          <p className="text-xs text-[var(--color-muted)] mb-4">Last 7 days in ₹</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last7Days} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v: any) => [`₹${v?.toLocaleString() ?? 0}`, 'Revenue']} contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#1d6fb8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="section-card"
        >
          <h2 className="font-bold text-[var(--color-text)] mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((a, i) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <a.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{a.msg}</p>
                  <p className="text-xs text-[var(--color-muted)]">{a.sub}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={a.badge === 'accepted' ? 'badge-success' : 'badge-warning'}>{a.badge}</span>
                  <p className="text-xs text-[var(--color-muted)] mt-1">{a.time}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-[var(--color-muted)] text-center py-8">No collections recorded today</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Morning Collected', value: `${todayCollections.filter(c => c.shift==='morning').reduce((s,c)=>s+c.qty,0).toFixed(1)} L`, icon: '🌅' },
          { label: 'Evening Collected', value: `${todayCollections.filter(c => c.shift==='evening').reduce((s,c)=>s+c.qty,0).toFixed(1)} L`, icon: '🌆' },
          { label: 'Avg Fat %',         value: `${(todayCollections.reduce((s,c)=>s+c.fat,0)/(todayCollections.length||1)).toFixed(2)}%`,  icon: '🧪' },
          { label: 'Today Entries',     value: todayCollections.length,                                                                     icon: '📋' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 + i * 0.05 }}
            className="section-card text-center"
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-xl font-bold text-[var(--color-text)]">{s.value}</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
