'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import FarmerPassbook from '@/components/reports/FarmerPassbook'
import { BarChart3, Download, TrendingUp, Milk, IndianRupee, Users, Printer, FileText } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

import type { Collection, Farmer } from '@/types'

export default function ReportsPage() {
  const { last7Days, collections, farmers, useSNF, payments } = useApp()
  const [period, setPeriod] = useState('weekly')

  const totalRevenue = collections.reduce((s: number, c: Collection)=>s+c.amount, 0)
  const totalMilk    = collections.reduce((s: number, c: Collection)=>s+c.qty, 0)
  const avgFat       = (collections.reduce((s: number, c: Collection)=>s+c.fat, 0)/(collections.length||1)).toFixed(2)
  const avgWater     = (collections.reduce((s: number, c: Collection)=>s+c.water, 0)/(collections.length||1)).toFixed(2)

  const farmerPerformance = farmers.slice(0,6).map((f: Farmer) => {
    const cols = collections.filter((c: Collection)=>c.farmerId===f.id)
    return {
      id: f.id,
      name: f.name.split(' ')[0],
      qty: cols.reduce((s: number, c: Collection)=>s+c.qty, 0),
      amount: cols.reduce((s: number, c: Collection)=>s+c.amount, 0),
      avgFat: +(cols.reduce((s: number, c: Collection)=>s+c.fat, 0)/(cols.length||1)).toFixed(2),
    }
  })

  const radarData = [
    { subject: 'Milk Qty',  A: 80, fullMark: 100 },
    { subject: 'Revenue',   A: 75, fullMark: 100 },
    { subject: 'Fat%',      A: 88, fullMark: 100 },
    { subject: 'Water%',    A: 82, fullMark: 100 },
    { subject: 'Farmers',   A: 70, fullMark: 100 },
    { subject: 'Payments',  A: 65, fullMark: 100 },
  ]

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="page-header mb-0">
          <h1 className="flex items-center gap-2"><BarChart3 className="w-6 h-6 text-blue-600" /> Reports & Analytics</h1>
          <p>Comprehensive insights into your dairy operations</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['weekly','monthly','yearly'].map(p => (
            <button key={p} id={`period-${p}`} onClick={()=>setPeriod(p)} className={`capitalize text-sm px-4 py-2 rounded-xl font-medium transition-all ${period===p?'btn-primary':'btn-secondary'}`}>
              {p}
            </button>
          ))}
          <button id="export-btn" className="btn-secondary text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Milk}         label="Total Milk"     value={`${totalMilk.toFixed(0)} L`}           color="blue"   delay={0}    />
        <StatCard icon={IndianRupee}  label="Total Revenue"  value={`₹${totalRevenue.toLocaleString()}`}   color="green"  delay={0.06} />
        <StatCard icon={TrendingUp}   label="Avg Fat %"      value={`${avgFat}%`}                          color="purple" delay={0.12} />
        <StatCard icon={Users}        label="Avg Water %"    value={`${avgWater}%`}                        color="orange" delay={0.18} />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="section-card">
          <h2 className="font-bold text-[var(--color-text)] mb-1">Milk Collection Trend</h2>
          <p className="text-xs text-[var(--color-muted)] mb-4">7-day daily totals in litres</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{fontSize:11,fill:'var(--color-muted)'}} />
              <YAxis tick={{fontSize:11,fill:'var(--color-muted)'}} unit=" L" />
              <Tooltip contentStyle={{borderRadius:'10px',fontSize:'12px'}} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12}} />
              <Line type="monotone" dataKey="total" name="Total" stroke="#1d6fb8" strokeWidth={2.5} dot={{r:4,fill:'#1d6fb8'}} activeDot={{r:6}} />
              <Line type="monotone" dataKey="morning" name="Morning" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              <Line type="monotone" dataKey="evening" name="Evening" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="section-card">
          <h2 className="font-bold text-[var(--color-text)] mb-1">Dairy Performance Radar</h2>
          <p className="text-xs text-[var(--color-muted)] mb-4">Overall score across key metrics</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="subject" tick={{fontSize:11,fill:'var(--color-muted)'}} />
              <PolarRadiusAxis angle={30} domain={[0,100]} tick={{fontSize:10}} />
              <Radar name="Performance" dataKey="A" stroke="#1d6fb8" fill="#1d6fb8" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip contentStyle={{borderRadius:'10px',fontSize:'12px'}} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Farmer performance */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="section-card">
        <h2 className="font-bold text-[var(--color-text)] mb-1">Farmer Performance</h2>
        <p className="text-xs text-[var(--color-muted)] mb-4">Top 6 farmers by milk quantity and revenue</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={farmerPerformance} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" tick={{fontSize:11,fill:'var(--color-muted)'}} />
            <YAxis yAxisId="left" tick={{fontSize:11,fill:'var(--color-muted)'}} unit=" L" />
            <YAxis yAxisId="right" orientation="right" tick={{fontSize:11,fill:'var(--color-muted)'}} tickFormatter={v=>`₹${v}`} />
            <Tooltip contentStyle={{borderRadius:'10px',fontSize:'12px'}} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12}} />
            <Bar yAxisId="left"  dataKey="qty"    name="Qty (L)"  fill="#1d6fb8" radius={[4,4,0,0]} />
            <Bar yAxisId="right" dataKey="amount" name="Revenue"  fill="#22c55e" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Summary table */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="section-card">
        <h2 className="font-bold text-[var(--color-text)] mb-4">Farmer-wise Summary</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Farmer</th><th>Collections</th><th>Total Qty (L)</th><th>Avg Fat%</th><th>Total Revenue</th></tr>
            </thead>
            <tbody>
              {farmerPerformance.map((f: any) => (
                <tr key={f.id}>
                  <td className="font-semibold text-[var(--color-text)]">{f.name}</td>
                  <td>{collections.filter((c: Collection)=>c.farmerId === f.id).length}</td>
                  <td>{f.qty.toFixed(1)}</td>
                  <td>{f.avgFat}%</td>
                  <td className="font-bold text-[var(--color-text)]">₹{f.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
