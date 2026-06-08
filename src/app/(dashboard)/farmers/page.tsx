'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import StatCard from '@/components/ui/StatCard'
import SearchBar from '@/components/ui/SearchBar'
import Modal from '@/components/ui/Modal'
import { Users, Plus, Edit2, Trash2, Phone, MapPin, User, Eye, CheckCircle, XCircle, BookOpen, X, ChevronDown, ChevronUp, Milk, IndianRupee, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_ROW = () => ({ name: '', village: '', phone: '', cattle: 1, customPricing: false, includesSnf: false, _key: Date.now() + Math.random() })

interface FarmerFormProps {
  onSave: () => void
  onCancel: () => void
  label: string
  form: any
  setForm: (form: any) => void
}

const FarmerForm = ({ onSave, onCancel, label, form, setForm }: FarmerFormProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Full Name *</label>
        <input id="farmer-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ramesh Kumar" className="input-field" />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Village *</label>
        <input id="farmer-village" value={form.village} onChange={e => setForm({ ...form, village: e.target.value })} placeholder="Sundarpur" className="input-field" />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Phone *</label>
        <input id="farmer-phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" className="input-field" />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Cattle Count</label>
        <input id="farmer-cattle" type="number" min={1} value={form.cattle} onChange={e => setForm({ ...form, cattle: +e.target.value })} className="input-field" />
      </div>
    </div>
    <div className="flex flex-col gap-3 mt-4 border-t border-[var(--color-border)] pt-4">
      <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)] cursor-pointer">
        <input type="checkbox" checked={form.customPricing || false} onChange={e => setForm({ ...form, customPricing: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        Enable Custom Pricing Rule
      </label>
      {form.customPricing && (
        <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)] cursor-pointer ml-6">
          <input type="checkbox" checked={form.includesSnf || false} onChange={e => setForm({ ...form, includesSnf: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          Includes Respective SNF
        </label>
      )}
    </div>
    <div className="flex gap-3 pt-2">
      <button onClick={onSave} className="btn-primary flex-1 justify-center">{label}</button>
      <button onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancel</button>
    </div>
  </div>
)

import { addFarmer, addFarmersBulk, updateFarmer, deleteFarmer } from '@/app/actions/farmers'
import type { Farmer } from '@/types'

export default function FarmersPage() {
  const { farmers, collections, payments } = useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [editFarmer, setEditFarmer] = useState<Farmer | null>(null)
  const [viewFarmer, setViewFarmer] = useState<Farmer | null>(null)
  const [form, setForm] = useState({ name: '', village: '', phone: '', cattle: 1, customPricing: false, includesSnf: false })

  // Book entry state
  const [bookOpen, setBookOpen] = useState(false)
  const [bookRows, setBookRows] = useState(() => Array.from({ length: 5 }, EMPTY_ROW))
  const tableEndRef = useRef(null)

  const filtered = farmers.filter((f: Farmer) => {
    const q = search.toLowerCase()
    const matchSearch = f.name.toLowerCase().includes(q) || f.village.toLowerCase().includes(q) || f.phone.includes(q) || f.id.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || f.status === statusFilter
    return matchSearch && matchStatus
  })

  const resetForm = () => setForm({ name: '', village: '', phone: '', cattle: 1, customPricing: false, includesSnf: false })

  const handleAdd = async () => {
    if (!form.name || !form.village || !form.phone) return toast.error('Please fill all fields')
    const res = await addFarmer(form)
    if (res.error) {
      return toast.error(Object.values(res.error).flat().join(', '))
    }
    toast.success('Farmer added successfully!')
    setAddOpen(false); resetForm()
  }

  const handleEdit = async () => {
    if (!form.name || !form.village || !form.phone) return toast.error('Please fill all fields')
    if (!editFarmer) return
    const res = await updateFarmer(editFarmer.id, form)
    if (res.error) {
      return toast.error(res.error)
    }
    toast.success('Farmer updated!')
    setEditFarmer(null); resetForm()
  }

  const handleDelete = async (f: Farmer) => {
    if (!confirm(`Delete farmer ${f.name}? This cannot be undone.`)) return
    const res = await deleteFarmer(f.id)
    if (res.error) {
      return toast.error(res.error)
    }
    toast.success('Farmer removed')
  }

  const openEdit = (f: Farmer) => {
    setForm({ name: f.name, village: f.village, phone: f.phone, cattle: f.cattle, customPricing: f.customPricing || false, includesSnf: f.includesSnf || false })
    setEditFarmer(f)
  }

  const getFarmerCollections = (id: string) => collections.filter(c => c.farmerId === id).slice(-10)

  // Book entry handlers
  const updateBookRow = (index: number, field: string, value: any) => {
    setBookRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row))
  }

  const addBookRow = () => {
    setBookRows(prev => [...prev, EMPTY_ROW()])
    setTimeout(() => (tableEndRef.current as any)?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const removeBookRow = (index: number) => {
    if (bookRows.length <= 1) return toast.error('Need at least one row')
    setBookRows(prev => prev.filter((_, i) => i !== index))
  }

  const handleBookDone = async () => {
    const valid = bookRows.filter(r => r.name.trim() && r.village.trim() && r.phone.trim())
    if (valid.length === 0) return toast.error('No valid entries to save. Fill at least name, village & phone.')
    const rows = valid.map(r => ({ name: r.name.trim(), village: r.village.trim(), phone: r.phone.trim(), cattle: r.cattle || 1, customPricing: r.customPricing || false, includesSnf: r.includesSnf || false }))
    const res = await addFarmersBulk(rows)
    if (res.error) {
      return toast.error(res.error)
    }
    toast.success(`${res.count} farmer${res.count! > 1 ? 's' : ''} added!`)
    setBookOpen(false)
    setBookRows(Array.from({ length: 5 }, EMPTY_ROW))
  }

  const openBook = () => {
    setBookRows(Array.from({ length: 5 }, EMPTY_ROW))
    setBookOpen(true)
  }

  const filledCount = bookRows.filter(r => r.name.trim() && r.village.trim() && r.phone.trim()).length

  const handleCancel = () => {
    setAddOpen(false)
    setEditFarmer(null)
    resetForm()
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="page-header mb-0">
          <h1 className="flex items-center gap-2"><Users className="w-6 h-6 text-blue-600" /> Farmer Management</h1>
          <p>Manage all registered milk suppliers</p>
        </div>
        <div className="flex items-center gap-2">
          <button id="book-entry-btn" onClick={openBook} className="btn-secondary">
            <BookOpen className="w-4 h-4" /> Book Entry
          </button>
          <button id="add-farmer-btn" onClick={() => { resetForm(); setAddOpen(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Farmer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Farmers" value={farmers.length} color="blue" delay={0} />
        <StatCard icon={CheckCircle} label="Active" value={farmers.filter(f => f.status === 'active').length} color="green" delay={0.06} />
        <StatCard icon={XCircle} label="Inactive" value={farmers.filter(f => f.status === 'inactive').length} color="red" delay={0.12} />
        <StatCard icon={User} label="Total Cattle" value={farmers.reduce((s, f) => s + f.cattle, 0)} color="orange" delay={0.18} />
      </div>

      {/* Table card */}
      <div className="section-card">
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search name, village, phone...">
            <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto text-sm">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </SearchBar>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Village</th><th>Phone</th><th>Cattle</th><th>Balance</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-[var(--color-muted)]">No farmers found</td></tr>
              )}
              {filtered.map((f, i) => (
                <motion.tr key={f.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <td className="font-mono text-xs text-[var(--color-muted)]">{f.id}</td>
                  <td className="font-semibold text-[var(--color-text)]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {f.name.slice(0, 2).toUpperCase()}
                      </div>
                      {f.name}
                    </div>
                  </td>
                  <td className="text-[var(--color-muted)]"><MapPin className="inline w-3 h-3 mr-1" />{f.village}</td>
                  <td className="text-[var(--color-muted)]"><Phone className="inline w-3 h-3 mr-1" />{f.phone}</td>
                  <td>{f.cattle} 🐄</td>
                  <td className={f.balance > 0 ? 'text-orange-600 font-semibold' : 'text-green-600 font-semibold'}>
                    ₹{f.balance.toLocaleString()}
                  </td>
                  <td><span className={f.status === 'active' ? 'badge-success' : 'badge-danger'}>{f.status}</span></td>
                  <td>
                    <div className="flex gap-1.5">
                      <button id={`view-farmer-${f.id}`} onClick={() => setViewFarmer(f)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button id={`edit-farmer-${f.id}`} onClick={() => openEdit(f)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button id={`delete-farmer-${f.id}`} onClick={() => handleDelete(f)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[var(--color-muted)] mt-3">Showing {filtered.length} of {farmers.length} farmers</p>
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={handleCancel} title="Add New Farmer">
        <FarmerForm onSave={handleAdd} onCancel={handleCancel} label="Add Farmer" form={form} setForm={setForm} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editFarmer} onClose={handleCancel} title={`Edit – ${editFarmer?.name}`}>
        <FarmerForm onSave={handleEdit} onCancel={handleCancel} label="Save Changes" form={form} setForm={setForm} />
      </Modal>

      {/* View Modal - Full Profile */}
      <Modal open={!!viewFarmer} onClose={() => setViewFarmer(null)} title={`Farmer Profile – ${viewFarmer?.id}`} size="5xl">
        {viewFarmer && (
          <div className="space-y-6 -mt-2">
            {/* Profile Header Card */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Users className="w-32 h-32" />
              </div>
              <div className="flex flex-wrap items-center gap-6 relative z-10">
                <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-3xl font-black shadow-2xl border-4 border-white/10">
                  {viewFarmer.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-black">{viewFarmer.name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-blue-200 font-medium">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {viewFarmer.village}</span>
                    <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {viewFarmer.phone}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {viewFarmer.joinDate}</span>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${viewFarmer.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {viewFarmer.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 text-white">
                      ID: {viewFarmer.id}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-[200px] flex justify-end">
                  <div className="text-right">
                    <p className="text-blue-300 text-xs font-bold uppercase mb-1">Current Balance</p>
                    <p className="text-4xl font-black text-white">₹{viewFarmer.balance.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Quick Stats & Collections */}
              <div className="lg:col-span-2 space-y-6">
                <div className="section-card !p-0 overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Milk className="w-4 h-4 text-blue-600" /> Recent Collections
                    </h4>
                  </div>
                  <div className="table-container max-h-[400px] overflow-y-auto">
                    <table className="!text-xs">
                      <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
                        <tr><th>Date</th><th>Shift</th><th>Qty (L)</th><th>Fat%</th><th>Rate</th><th>Total</th></tr>
                      </thead>
                      <tbody>
                        {collections.filter(c => c.farmerId === viewFarmer.id).slice(-15).reverse().map(c => (
                          <tr key={c.id}>
                            <td className="font-mono">{c.date}</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${c.shift === 'morning' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                {c.shift}
                              </span>
                            </td>
                            <td className="font-bold">{c.qty}</td>
                            <td>{c.fat}%</td>
                            <td className="text-slate-500 italic">₹{c.rate}</td>
                            <td className="font-black">₹{c.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Payment History & Info */}
              <div className="space-y-6">
                <div className="section-card !p-0 overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-green-600" /> Payment History
                    </h4>
                  </div>
                  <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {payments.filter(p => p.farmerId === viewFarmer.id).length === 0 ? (
                      <p className="text-center py-8 text-slate-400 italic text-sm">No payment records found.</p>
                    ) : (
                      payments.filter(p => p.farmerId === viewFarmer.id).reverse().map(p => (
                        <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${p.status === 'paid' ? 'bg-green-500' : 'bg-orange-500'}`} />
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{p.method} Payment</p>
                              <p className="text-[10px] text-slate-500 font-bold">{p.date}</p>
                            </div>
                            <p className="text-lg font-black text-slate-900 dark:text-white">₹{p.amount.toLocaleString()}</p>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {p.status}
                            </span>
                            <p className="text-[9px] text-slate-400 italic font-medium">{p.note || 'No notes'}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="section-card bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30">
                  <h4 className="font-black text-xs uppercase tracking-widest text-blue-800 dark:text-blue-400 mb-4">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="btn-primary text-[10px] py-2 justify-center">New Payment</button>
                    <button className="btn-secondary text-[10px] py-2 justify-center bg-white">Add Collection</button>
                    <button className="btn-secondary text-[10px] py-2 col-span-2 justify-center bg-white" onClick={() => {
                      setViewFarmer(null)
                      openEdit(viewFarmer)
                    }}>Update Profile Info</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Book Entry Full-Screen */}
      <AnimatePresence>
        {bookOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-surface)] w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col border border-[var(--color-border)]"
            >
              {/* Book Header */}
              <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" /> Farmer Book Entry
                  </h2>
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    Fill in farmer details row by row. Press <strong>Done</strong> when complete.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full">
                    {filledCount} / {bookRows.length} filled
                  </span>
                  <button onClick={() => setBookOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Book Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[var(--color-bg)]">
                <div className="table-container bg-[var(--color-surface)]">
                  <table>
                    <thead>
                      <tr>
                        <th className="w-14 text-center">S.No</th>
                        <th>Farmer Name *</th>
                        <th>Village *</th>
                        <th>Phone *</th>
                        <th className="w-24">Cattle</th>
                        <th className="w-16 text-center">Status</th>
                        <th className="w-14"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookRows.map((row, i) => {
                        const isFilled = row.name.trim() && row.village.trim() && row.phone.trim()
                        return (
                          <tr key={row._key} className="group">
                            <td className="text-center">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold text-[var(--color-muted)]">
                                {i + 1}
                              </span>
                            </td>
                            <td>
                              <input
                                type="text"
                                value={row.name}
                                onChange={e => updateBookRow(i, 'name', e.target.value)}
                                placeholder="Enter name..."
                                className="input-field py-1.5 px-2 text-sm"
                                autoFocus={i === 0}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={row.village}
                                onChange={e => updateBookRow(i, 'village', e.target.value)}
                                placeholder="Village..."
                                className="input-field py-1.5 px-2 text-sm"
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={row.phone}
                                onChange={e => updateBookRow(i, 'phone', e.target.value)}
                                placeholder="Phone..."
                                className="input-field py-1.5 px-2 text-sm"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min={1}
                                value={row.cattle}
                                onChange={e => updateBookRow(i, 'cattle', +e.target.value || 1)}
                                className="input-field py-1.5 px-2 text-sm"
                              />
                            </td>
                            <td className="text-center">
                              {isFilled ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-950/30 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400">
                                  <span className="w-2 h-2 rounded-full bg-current" />
                                </span>
                              )}
                            </td>
                            <td className="text-center">
                              <button
                                onClick={() => removeBookRow(i)}
                                className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 hover:text-red-600 transition-all"
                                title="Remove row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div ref={tableEndRef} />
                </div>

                {/* Add Row Button */}
                <button
                  onClick={addBookRow}
                  className="mt-3 w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-sm font-medium text-[var(--color-muted)] hover:text-blue-600 hover:border-blue-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add More Rows
                </button>
              </div>

              {/* Book Footer */}
              <div className="p-4 sm:p-6 border-t border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
                <p className="text-sm text-[var(--color-muted)]">
                  {filledCount > 0
                    ? `${filledCount} farmer${filledCount > 1 ? 's' : ''} ready to be added`
                    : 'Fill in farmer details above'}
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setBookOpen(false)} className="btn-secondary">Cancel</button>
                  <button
                    onClick={handleBookDone}
                    disabled={filledCount === 0}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" /> Done — Add {filledCount} Farmer{filledCount !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
