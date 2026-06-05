'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import StatCard from '@/components/ui/StatCard'
import { Package, Thermometer, Droplets, CheckCircle, AlertTriangle, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

import type { Tank } from '@/types'

import { updateTank as updateTankAction } from '@/app/actions/tanks'

interface TankCardProps {
  tank: Tank
  onUpdate: (id: string, data: Partial<Tank>) => void
}

function TankCard({ tank, onUpdate }: TankCardProps) {
  const pct = Math.min(100, Math.round((tank.current / tank.capacity) * 100))
  const color = pct > 80 ? 'red' : pct > 60 ? 'orange' : 'blue'
  const statusColor = tank.status === 'operational' ? 'badge-success' : 'badge-danger'

  const barColors = { red: '#ef4444', orange: '#f59e0b', blue: '#1d6fb8' }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="section-card card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-[var(--color-text)]">{tank.name}</h3>
          <p className="text-xs text-[var(--color-muted)]">{tank.id}</p>
        </div>
        <span className={statusColor}>{tank.status}</span>
      </div>

      {/* Fill bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-[var(--color-muted)] mb-1.5">
          <span>Fill Level</span>
          <span className="font-semibold" style={{ color: barColors[color] }}>{pct}%</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${barColors[color]}aa, ${barColors[color]})` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[var(--color-muted)] mt-1">
          <span>{tank.current.toLocaleString()} L</span>
          <span>{tank.capacity.toLocaleString()} L</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 text-center">
          <Thermometer className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-[var(--color-text)]">{tank.temp}°C</p>
          <p className="text-xs text-[var(--color-muted)]">Temperature</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-3 text-center">
          <Droplets className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto mb-1" />
          <p className="text-sm font-bold text-[var(--color-text)]">{(tank.capacity - tank.current).toLocaleString()} L</p>
          <p className="text-xs text-[var(--color-muted)]">Available</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-muted)]">
        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
        Last cleaned: {tank.lastCleaned}
      </div>

      <div className="mt-3 flex gap-2">
        {tank.status === 'operational' ? (
          <button onClick={() => { onUpdate(tank.id, { status: 'maintenance' }); toast.success(`${tank.name} set to maintenance`) }}
            className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center">
            <Settings className="w-3.5 h-3.5" /> Mark Maintenance
          </button>
        ) : (
          <button onClick={() => { onUpdate(tank.id, { status: 'operational' }); toast.success(`${tank.name} back online`) }}
            className="btn-primary text-xs py-1.5 px-3 flex-1 justify-center">
            <CheckCircle className="w-3.5 h-3.5" /> Mark Operational
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function InventoryPage() {
  const { tanks } = useApp()

  const updateTank = async (id: string, data: Partial<Tank>) => {
    const res = await updateTankAction(id, data)
    if (res.error) {
      toast.error(res.error)
    }
  }

  const totalCapacity = tanks.reduce((s: number, t: Tank)=>s+t.capacity, 0)
  const totalCurrent  = tanks.reduce((s: number, t: Tank)=>s+t.current, 0)
  const operational   = tanks.filter((t: Tank)=>t.status==='operational').length

  const PRODUCTS = [
    { name: 'Fresh Whole Milk',  qty: totalCurrent,       unit:'L',   icon:'🥛', status:'normal' },
    { name: 'Cream',             qty: Math.round(totalCurrent*0.035), unit:'L', icon:'🍶', status:'normal' },
    { name: 'Paneer',            qty: 48,                 unit:'kg',  icon:'🧀', status:'low'    },
    { name: 'Ghee',              qty: 22,                 unit:'kg',  icon:'🫙', status:'normal' },
    { name: 'Butter',            qty: 35,                 unit:'kg',  icon:'🧈', status:'normal' },
    { name: 'Curd',              qty: 120,                unit:'kg',  icon:'🥣', status:'normal' },
  ]

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <h1 className="flex items-center gap-2"><Package className="w-6 h-6 text-blue-600" /> Inventory & Storage</h1>
        <p>Monitor milk tanks, cooling units, and product stock</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Package}     label="Total Capacity"  value={`${totalCapacity.toLocaleString()} L`} color="blue"   delay={0}    />
        <StatCard icon={Droplets}    label="Currently Stored" value={`${totalCurrent.toLocaleString()} L`} color="green"  delay={0.06} />
        <StatCard icon={CheckCircle} label="Operational Tanks" value={`${operational}/${tanks.length}`}   color="purple" delay={0.12} />
        <StatCard icon={AlertTriangle} label="Maintenance"    value={tanks.filter(t=>t.status==='maintenance').length} color="orange" delay={0.18} />
      </div>

      {/* Tank cards */}
      <div>
        <h2 className="font-bold text-[var(--color-text)] mb-4">Storage Tanks & Cooling Units</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tanks.map(tank => (
            <TankCard key={tank.id} tank={tank} onUpdate={updateTank} />
          ))}
        </div>
      </div>

      {/* Product stock */}
      <div className="section-card">
        <h2 className="font-bold text-[var(--color-text)] mb-4">Product Stock</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
              className={`rounded-xl p-4 text-center border ${p.status==='low' ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20' : 'border-[var(--color-border)] bg-slate-50 dark:bg-slate-800'}`}
            >
              <div className="text-3xl mb-2">{p.icon}</div>
              <p className="font-bold text-lg text-[var(--color-text)]">{p.qty.toLocaleString()}</p>
              <p className="text-xs text-[var(--color-muted)]">{p.unit}</p>
              <p className="text-xs font-medium text-[var(--color-text)] mt-1 leading-tight">{p.name}</p>
              {p.status === 'low' && (
                <span className="badge-warning mt-2 inline-block">Low Stock</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
