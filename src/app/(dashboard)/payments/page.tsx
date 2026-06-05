'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import SearchBar from '@/components/ui/SearchBar'
import { CreditCard, Plus, CheckCircle, Clock, IndianRupee, Printer } from 'lucide-react'
import toast from 'react-hot-toast'

import type { Payment, Farmer } from '@/types'

import { addPayment, markPaymentPaid } from '@/app/actions/payments'

export default function PaymentsPage() {
  const { payments, farmers } = useApp()
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [invoicePayment, setInvoicePayment] = useState<Payment | null>(null)
  const [form, setForm] = useState({ farmerId:'', amount:'', method:'bank', note:'Monthly payment' })

  const filtered = payments.filter((p: Payment) => {
    const q = search.toLowerCase()
    return (
      (p.farmerName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) &&
      (statusFilter === 'all' || p.status === statusFilter)
    )
  }).sort((a: Payment, b: Payment) => b.date.localeCompare(a.date))

  const totalPaid    = payments.filter((p: Payment) => p.status==='paid').reduce((s: number, p: Payment)=>s+p.amount, 0)
  const totalPending = payments.filter((p: Payment) => p.status==='pending').reduce((s: number, p: Payment)=>s+p.amount, 0)

  const handleAdd = async () => {
    if (!form.farmerId || !form.amount) return toast.error('Fill all fields')
    const farmer = farmers.find((f: Farmer) => f.id === form.farmerId)
    if (!farmer) return toast.error('Farmer not found')

    const res = await addPayment({ 
      farmerId: form.farmerId,
      amount: +form.amount, 
      farmerName: farmer.name, 
      date: new Date().toISOString().split('T')[0], 
      status: 'pending' as const,
      method: form.method as any,
      note: form.note
    })
    if (res.error) {
      return toast.error(Object.values(res.error).flat().join(', '))
    }
    toast.success('Payment added!')
    setAddOpen(false)
    setForm({ farmerId:'', amount:'', method:'bank', note:'Monthly payment' })
  }

  const handleMarkPaid = async (p: Payment) => {
    const res = await markPaymentPaid(p.id)
    if (res.error) {
      return toast.error(res.error)
    }
    toast.success(`Payment for ${p.farmerName} marked as paid`)
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="page-header mb-0">
          <h1 className="flex items-center gap-2"><CreditCard className="w-6 h-6 text-blue-600" /> Payment Management</h1>
          <p>Track farmer payments, pending dues, and generate invoices</p>
        </div>
        <button id="add-payment-btn" onClick={() => setAddOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Payment
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="Total Paid"     value={`₹${totalPaid.toLocaleString()}`}    color="green"  delay={0}    />
        <StatCard icon={Clock}       label="Pending"        value={`₹${totalPending.toLocaleString()}`} color="orange" delay={0.06} />
        <StatCard icon={CreditCard}  label="Total Entries"  value={payments.length}                      color="blue"   delay={0.12} />
        <StatCard icon={CheckCircle} label="Paid Entries"   value={payments.filter(p=>p.status==='paid').length} color="purple" delay={0.18} />
      </div>

      <div className="section-card">
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search farmer name...">
            <select id="payment-status-filter" value={statusFilter} onChange={e=>setStatus(e.target.value)} className="input-field w-auto text-sm">
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </SearchBar>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr><th>ID</th><th>Farmer</th><th>Amount</th><th>Date</th><th>Method</th><th>Note</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-[var(--color-muted)]">No payments found</td></tr>
              )}
              {filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity:0,x:-8 }} animate={{ opacity:1,x:0 }} transition={{ delay: i*0.04 }}>
                  <td className="font-mono text-xs text-[var(--color-muted)]">{p.id}</td>
                  <td className="font-semibold text-[var(--color-text)]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">{p.farmerName.slice(0,2).toUpperCase()}</div>
                      {p.farmerName}
                    </div>
                  </td>
                  <td className="font-bold text-[var(--color-text)]">₹{p.amount.toLocaleString()}</td>
                  <td className="text-[var(--color-muted)]">{p.date}</td>
                  <td><span className="capitalize text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md font-medium">{p.method}</span></td>
                  <td className="text-[var(--color-muted)] text-xs max-w-[150px] truncate">{p.note}</td>
                  <td><span className={p.status==='paid'?'badge-success':'badge-warning'}>{p.status}</span></td>
                  <td>
                    <div className="flex gap-1.5">
                      {p.status === 'pending' && (
                        <button id={`pay-btn-${p.id}`} onClick={() => handleMarkPaid(p)} className="btn-primary py-1 px-2.5 text-xs">
                          <CheckCircle className="w-3.5 h-3.5" /> Mark Paid
                        </button>
                      )}
                      <button id={`invoice-btn-${p.id}`} onClick={() => setInvoicePayment(p)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-[var(--color-muted)] transition-colors" title="Invoice">
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Payment">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Farmer *</label>
            <select id="payment-farmer" value={form.farmerId} onChange={e=>setForm({...form,farmerId:e.target.value})} className="input-field">
              <option value="">-- Select Farmer --</option>
              {farmers.map(f=><option key={f.id} value={f.id}>{f.name} (Balance: ₹{f.balance})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Amount (₹) *</label>
              <input id="payment-amount" type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="5000" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Method</label>
              <select id="payment-method" value={form.method} onChange={e=>setForm({...form,method:e.target.value})} className="input-field">
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Note</label>
            <input id="payment-note" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleAdd} className="btn-primary flex-1 justify-center">Add Payment</button>
            <button onClick={() => setAddOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Invoice Modal */}
      <Modal open={!!invoicePayment} onClose={() => setInvoicePayment(null)} title="Payment Invoice" size="md">
        {invoicePayment && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-r from-blue-600 to-sky-500 rounded-xl text-white">
              <p className="text-xs uppercase tracking-widest text-blue-100 mb-1">DairyFlow</p>
              <h3 className="text-xl font-bold">Payment Invoice</h3>
              <p className="text-blue-100 text-sm">{invoicePayment.id}</p>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ['Farmer',  invoicePayment.farmerName],
                ['Amount',  `₹${invoicePayment.amount.toLocaleString()}`],
                ['Date',    invoicePayment.date],
                ['Method',  invoicePayment.method.toUpperCase()],
                ['Status',  invoicePayment.status.toUpperCase()],
                ['Note',    invoicePayment.note],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-muted)]">{k}</span>
                  <span className="font-semibold text-[var(--color-text)]">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => window.print()} className="btn-primary w-full justify-center">
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
