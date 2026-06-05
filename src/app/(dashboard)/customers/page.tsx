'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import SearchBar from '@/components/ui/SearchBar'
import { ShoppingCart, Plus, Edit2, Trash2, User, Package } from 'lucide-react'
import toast from 'react-hot-toast'

interface CustomerFormProps {
  onSave: () => void
  onCancel: () => void
  label: string
  form: any
  setForm: (form: any) => void
}

const CustomerForm = ({ onSave, onCancel, label, form, setForm }: CustomerFormProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Name *</label>
        <input id="customer-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Shop/Customer name" className="input-field" />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Type</label>
        <select id="customer-type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field">
          <option value="retail">Retail</option>
          <option value="bulk">Bulk</option>
          <option value="subscription">Subscription</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Phone *</label>
        <input id="customer-phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" className="input-field" />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Daily Qty (L)</label>
        <input id="customer-qty" type="number" min={1} value={form.dailyQty} onChange={e => setForm({ ...form, dailyQty: +e.target.value })} className="input-field" />
      </div>
    </div>
    <div>
      <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Address</label>
      <input id="customer-address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Full address" className="input-field" />
    </div>
    <div className="flex gap-3 pt-2">
      <button onClick={onSave} className="btn-primary flex-1 justify-center">{label}</button>
      <button onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancel</button>
    </div>
  </div>
)

import { addCustomer, updateCustomer, deleteCustomer } from '@/app/actions/customers'
import type { Customer } from '@/types'

export default function CustomersPage() {
  const { customers } = useApp()
  const [search, setSearch] = useState('')
  const [typeFilter, setType] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [form, setForm] = useState<{
    name: string
    type: 'retail' | 'bulk' | 'subscription'
    phone: string
    address: string
    dailyQty: number
  }>({ name: '', type: 'retail', phone: '', address: '', dailyQty: 10 })

  const filtered = customers.filter((c: Customer) => {
    const q = search.toLowerCase()
    return (
      (c.name.toLowerCase().includes(q) || c.phone.includes(q)) &&
      (typeFilter === 'all' || c.type === typeFilter)
    )
  })

  const resetForm = () => setForm({ name: '', type: 'retail', phone: '', address: '', dailyQty: 10 })

  const handleAdd = async () => {
    if (!form.name || !form.phone) return toast.error('Fill all required fields')
    const res = await addCustomer(form)
    if (res.error) {
      return toast.error(Object.values(res.error).flat().join(', '))
    }
    toast.success('Customer added!')
    setAddOpen(false); resetForm()
  }

  const handleEdit = async () => {
    if (!editCustomer) return
    const res = await updateCustomer(editCustomer.id, form)
    if (res.error) {
      return toast.error(res.error)
    }
    toast.success('Customer updated!')
    setEditCustomer(null); resetForm()
  }

  const handleCancel = () => {
    setAddOpen(false)
    setEditCustomer(null)
    resetForm()
  }

  const openEdit = (c: Customer) => {
    setForm({ name: c.name, type: c.type, phone: c.phone, address: c.address, dailyQty: c.dailyQty })
    setEditCustomer(c)
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="page-header mb-0">
          <h1 className="flex items-center gap-2"><ShoppingCart className="w-6 h-6 text-blue-600" /> Customer Management</h1>
          <p>Manage milk customers, deliveries, and subscriptions</p>
        </div>
        <button id="add-customer-btn" onClick={() => { resetForm(); setAddOpen(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} label="Total Customers" value={customers.length} color="blue" delay={0} />
        <StatCard icon={User} label="Active" value={customers.filter(c => c.status === 'active').length} color="green" delay={0.06} />
        <StatCard icon={Package} label="Daily Supply (L)" value={customers.filter(c => c.status === 'active').reduce((s, c) => s + c.dailyQty, 0)} color="purple" delay={0.12} />
        <StatCard icon={ShoppingCart} label="Bulk Customers" value={customers.filter(c => c.type === 'bulk').length} color="orange" delay={0.18} />
      </div>

      <div className="section-card">
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search customer name or phone...">
            <select id="type-filter" value={typeFilter} onChange={e => setType(e.target.value)} className="input-field w-auto text-sm">
              <option value="all">All Types</option>
              <option value="retail">Retail</option>
              <option value="bulk">Bulk</option>
              <option value="subscription">Subscription</option>
            </select>
          </SearchBar>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Type</th><th>Phone</th><th>Address</th><th>Daily Qty</th><th>Balance</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={9} className="text-center py-10 text-[var(--color-muted)]">No customers found</td></tr>}
              {filtered.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <td className="font-mono text-xs text-[var(--color-muted)]">{c.id}</td>
                  <td className="font-semibold text-[var(--color-text)]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      {c.name}
                    </div>
                  </td>
                  <td><span className={c.type === 'bulk' ? 'badge-blue' : c.type === 'subscription' ? 'badge-success' : 'badge-warning'}>{c.type}</span></td>
                  <td className="text-[var(--color-muted)]">{c.phone}</td>
                  <td className="text-[var(--color-muted)] text-xs max-w-[140px] truncate">{c.address}</td>
                  <td className="font-semibold">{c.dailyQty} L</td>
                  <td className={c.balance > 0 ? 'text-orange-600 font-semibold' : 'text-green-600'}>₹{c.balance.toLocaleString()}</td>
                  <td><span className={c.status === 'active' ? 'badge-success' : 'badge-danger'}>{c.status}</span></td>
                  <td>
                    <div className="flex gap-1.5">
                      <button id={`edit-customer-${c.id}`} onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button id={`delete-customer-${c.id}`} onClick={async () => {
                        const res = await deleteCustomer(c.id)
                        if (res.error) {
                          toast.error(res.error)
                        } else {
                          toast.success('Customer removed')
                        }
                      }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[var(--color-muted)] mt-3">Showing {filtered.length} of {customers.length} customers</p>
      </div>

      <Modal open={addOpen} onClose={handleCancel} title="Add New Customer">
        <CustomerForm onSave={handleAdd} onCancel={handleCancel} label="Add Customer" form={form} setForm={setForm} />
      </Modal>
      <Modal open={!!editCustomer} onClose={handleCancel} title={`Edit – ${editCustomer?.name}`}>
        <CustomerForm onSave={handleEdit} onCancel={handleCancel} label="Save Changes" form={form} setForm={setForm} />
      </Modal>
    </div>
  )
}
