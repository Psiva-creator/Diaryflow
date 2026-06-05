'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import SearchBar from '@/components/ui/SearchBar'
import FarmerPassbook from '@/components/reports/FarmerPassbook'
import {
  LibraryBig, Receipt as ReceiptIcon, IndianRupee, Users, CalendarDays,
  Printer, Eye, FileText, Download, CheckCircle2, Search, Calendar
} from 'lucide-react'

import type { Receipt, Collection, Farmer } from '@/types'

export default function LibraryPage() {
  const { receipts, farmers, collections, useSNF, payments } = useApp()
  const [search, setSearch]         = useState('')
  const [methodFilter, setMethod]   = useState('all')
  const [dateFrom, setDateFrom]     = useState('')
  const [dateTo, setDateTo]         = useState('')
  const [viewReceipt, setViewReceipt] = useState<Receipt | null>(null)

  // Batch Passbook State
  const [receiptsOpen, setReceiptsOpen] = useState(false)
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('all')
  const [passbookDateFrom, setPassbookDateFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 15)
    return d.toISOString().split('T')[0]
  })
  const [passbookDateTo, setPassbookDateTo] = useState(new Date().toISOString().split('T')[0])

  // Filtered receipts
  const filtered = useMemo(() => {
    return receipts.filter((r) => {
      const q = search.toLowerCase()
      const matchesSearch = r.farmerName.toLowerCase().includes(q) ||
                           r.id.toLowerCase().includes(q) ||
                           r.paymentId.toLowerCase().includes(q)
      const matchesMethod = methodFilter === 'all' || r.method === methodFilter
      const matchesFrom = !dateFrom || r.paidDate >= dateFrom
      const matchesTo   = !dateTo   || r.paidDate <= dateTo
      return matchesSearch && matchesMethod && matchesFrom && matchesTo
    }).sort((a, b) => b.paidDate.localeCompare(a.paidDate))
  }, [receipts, search, methodFilter, dateFrom, dateTo])

  // Stats
  const totalReceipts = receipts.length
  const totalAmount   = receipts.reduce((s, r) => s + r.amount, 0)
  const uniqueFarmers = new Set(receipts.map(r => r.farmerId)).size

  // Current month receipts
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonthTotal = receipts
    .filter(r => r.paidDate.startsWith(currentMonth))
    .reduce((s, r) => s + r.amount, 0)

  const methodLabel = (m: string) => {
    switch (m) {
      case 'bank': return 'Bank Transfer'
      case 'upi':  return 'UPI'
      case 'cash': return 'Cash'
      case 'cheque': return 'Cheque'
      default: return m
    }
  }

  const methodBadgeClass = (m: string) => {
    switch (m) {
      case 'bank':   return 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
      case 'upi':    return 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
      case 'cash':   return 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300'
      case 'cheque': return 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
      default:       return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="page-header mb-0">
          <h1 className="flex items-center gap-2">
            <LibraryBig className="w-6 h-6 text-blue-600" /> Receipt Library
          </h1>
          <p>Browse and manage receipts for all paid farmer bills</p>
        </div>
        <button id="batch-receipts-btn" onClick={() => setReceiptsOpen(true)} className="btn-primary text-sm bg-blue-600">
          <FileText className="w-4 h-4" /> 15-Day Passbooks
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FileText}     label="Total Receipts"  value={totalReceipts}                                     color="blue"   delay={0}    />
        <StatCard icon={IndianRupee}  label="Total Paid"      value={`₹${totalAmount.toLocaleString()}`}                 color="green"  delay={0.06} />
        <StatCard icon={Users}        label="Farmers Paid"    value={uniqueFarmers}                                      color="purple" delay={0.12} />
        <StatCard icon={CalendarDays} label="This Month"      value={`₹${thisMonthTotal.toLocaleString()}`}              color="orange" delay={0.18} />
      </div>

      {/* Receipts Table */}
      <div className="section-card">
        <div className="flex flex-wrap gap-3 mb-4 items-end">
          <SearchBar value={search} onChange={setSearch} placeholder="Search farmer, receipt or payment ID...">
            <select
              id="receipt-method-filter"
              value={methodFilter}
              onChange={e => setMethod(e.target.value)}
              className="input-field w-auto text-sm"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
            </select>
            <div className="flex items-center gap-2">
              <input
                id="receipt-date-from"
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="input-field w-auto text-sm"
                title="From date"
              />
              <span className="text-[var(--color-muted)] text-xs">to</span>
              <input
                id="receipt-date-to"
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="input-field w-auto text-sm"
                title="To date"
              />
            </div>
          </SearchBar>
        </div>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-[var(--color-muted)]" />
            </div>
            <p className="text-[var(--color-muted)] font-medium">No receipts found</p>
            <p className="text-xs text-[var(--color-muted)] mt-1">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Receipt ID</th>
                    <th>Payment ID</th>
                    <th>Farmer</th>
                    <th>Amount</th>
                    <th>Bill Date</th>
                    <th>Paid Date</th>
                    <th>Method</th>
                    <th>Note</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className="font-mono text-xs text-[var(--color-muted)]">{r.id}</td>
                      <td className="font-mono text-xs text-[var(--color-muted)]">{r.paymentId}</td>
                      <td className="font-semibold text-[var(--color-text)]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
                            {r.farmerName.slice(0, 2).toUpperCase()}
                          </div>
                          {r.farmerName}
                        </div>
                      </td>
                      <td className="font-bold text-[var(--color-text)]">₹{r.amount.toLocaleString()}</td>
                      <td className="text-[var(--color-muted)]">{r.date}</td>
                      <td className="text-[var(--color-text)]">{r.paidDate}</td>
                      <td>
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium capitalize ${methodBadgeClass(r.method)}`}>
                          {methodLabel(r.method)}
                        </span>
                      </td>
                      <td className="text-[var(--color-muted)] text-xs max-w-[150px] truncate">{r.note || '—'}</td>
                      <td>
                        <button
                          id={`view-receipt-${r.id}`}
                          onClick={() => setViewReceipt(r)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400 transition-colors"
                          title="View Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-3">
              Showing {filtered.length} of {receipts.length} receipts
            </p>
          </>
        )}
      </div>

      {/* Receipt Detail Modal */}
      <Modal open={!!viewReceipt} onClose={() => setViewReceipt(null)} title="Payment Receipt" size="md">
        {viewReceipt && (
          <div className="space-y-5">
            {/* Receipt Header */}
            <div className="text-center p-5 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 rounded-xl text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-6 -top-6 w-32 h-32 border-4 border-white rounded-full" />
                <div className="absolute -left-4 -bottom-4 w-24 h-24 border-4 border-white rounded-full" />
              </div>
              <div className="relative">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-200" />
                  <span className="text-xs uppercase tracking-widest text-blue-100 font-semibold">Paid</span>
                </div>
                <p className="text-xs uppercase tracking-widest text-blue-100 mb-1">DairyFlow</p>
                <h3 className="text-2xl font-bold">Payment Receipt</h3>
                <p className="text-blue-100 text-sm mt-1 font-mono">{viewReceipt.id}</p>
              </div>
            </div>

            {/* Farmer Info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm">
                {viewReceipt.farmerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[var(--color-text)]">{viewReceipt.farmerName}</p>
                <p className="text-xs text-[var(--color-muted)]">ID: {viewReceipt.farmerId}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{viewReceipt.amount.toLocaleString()}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-2 text-sm">
              {[
                ['Receipt ID',  viewReceipt.id],
                ['Payment ID',  viewReceipt.paymentId],
                ['Bill Date',   viewReceipt.date],
                ['Paid Date',   viewReceipt.paidDate],
                ['Method',      methodLabel(viewReceipt.method)],
                ['Note',        viewReceipt.note || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-muted)]">{k}</span>
                  <span className="font-semibold text-[var(--color-text)]">{v}</span>
                </div>
              ))}
            </div>

            {/* Print Button */}
            <button
              id="print-receipt-btn"
              onClick={() => window.print()}
              className="btn-primary w-full justify-center"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
          </div>
        )}
      </Modal>

      {/* Batch Receipts Modal */}
      <Modal open={receiptsOpen} onClose={() => setReceiptsOpen(false)} title="Generate 15-Day Passbooks" size="5xl">
        <div className="space-y-6">
          <div id="batch-receipts-controls" className="flex flex-wrap items-end gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Select Farmer</label>
              <select 
                value={selectedFarmerId} 
                onChange={e => setSelectedFarmerId(e.target.value)}
                className="input-field py-1.5 min-w-[200px]"
              >
                <option value="all">All Farmers</option>
                {farmers.filter(f => f.status === 'active').map(f => (
                  <option key={f.id} value={f.id}>{f.id} - {f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">From Date</label>
              <input type="date" value={passbookDateFrom} onChange={e=>setPassbookDateFrom(e.target.value)} className="input-field py-1.5" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">To Date</label>
              <input type="date" value={passbookDateTo} onChange={e=>setPassbookDateTo(e.target.value)} className="input-field py-1.5" />
            </div>
            <div className="flex-1" />
            <button onClick={() => window.print()} className="btn-primary">
              <Printer className="w-4 h-4" /> Print {selectedFarmerId === 'all' ? 'All' : 'Selected'} Passbooks
            </button>
          </div>

          <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar print:max-h-none print:overflow-visible">
            {farmers
              .filter(f => f.status === 'active' && (selectedFarmerId === 'all' || f.id === selectedFarmerId))
              .map(farmer => {
                const farmerCols = collections.filter(c => 
                  c.farmerId === farmer.id && 
                  c.date >= passbookDateFrom && 
                  c.date <= passbookDateTo
                ).sort((a, b) => a.date.localeCompare(b.date) || a.shift.localeCompare(b.shift))

                const farmerPayments = payments.filter(p => 
                  p.farmerId === farmer.id && 
                  p.date >= passbookDateFrom && 
                  p.date <= passbookDateTo &&
                  p.status === 'paid'
                )

                if (farmerCols.length === 0 && farmerPayments.length === 0) return null

                return (
                  <FarmerPassbook 
                    key={farmer.id} 
                    farmer={farmer} 
                    collections={farmerCols} 
                    payments={farmerPayments}
                    startDate={passbookDateFrom} 
                    endDate={passbookDateTo} 
                    useSNF={useSNF} 
                  />
                )
              })}
          </div>
        </div>
      </Modal>
    </div>
  )
}
