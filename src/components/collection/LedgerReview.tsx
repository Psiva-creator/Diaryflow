'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Trash2, User, UserPlus } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { calcRate } from '@/lib/rateCalculator'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'

interface LedgerEntry {
  farmerName: string
  farmerId: string | null
  qty: number | null
  fat: number | null
  water: number | null
  snf?: number | null
  shift: 'morning' | 'evening'
}

interface LedgerReviewProps {
  data: LedgerEntry[]
  date: string
  onSave: (finalData: any[]) => void
  onCancel: () => void
}

export default function LedgerReview({ data, date, onSave, onCancel }: LedgerReviewProps) {
  const { farmers, useSNF, addFarmer } = useApp()
  const [entries, setEntries] = useState(data.map((item, index) => {
    // Attempt to auto-match farmer by ID or Name
    const matched = farmers.find(f => 
      (item.farmerId && f.id === item.farmerId) || 
      f.name.toLowerCase() === item.farmerName.toLowerCase()
    )
    return { ...item, matchedId: matched?.id || '', tempId: index }
  }))

  const [newFarmerOpen, setNewFarmerOpen] = useState(false)
  const [farmerForm, setFarmerForm] = useState({ name: '', village: '', phone: '', cattle: 1 })

  const updateEntry = (index: number, field: string, value: any) => {
    setEntries(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e))
  }

  const deleteEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index))
  }

  const handleQuickAddFarmer = () => {
    if (!farmerForm.name || !farmerForm.village || !farmerForm.phone) return toast.error('Please fill all fields')
    addFarmer(farmerForm as any)
    toast.success('Farmer added successfully!')
    setNewFarmerOpen(false)
    setFarmerForm({ name: '', village: '', phone: '', cattle: 1 })
  }

  const handleSaveAll = () => {
    const validEntries: any[] = []
    for (const e of entries) {
      if (!e.matchedId) {
        toast.error(`Please select a farmer for ${e.farmerName || 'unnamed row'}`)
        return
      }
      if (e.qty === null || e.fat === null || e.water === null || (useSNF && e.snf === null)) {
        toast.error(`Missing data for ${e.farmerName}`)
        return
      }
      
      const farmer = farmers.find(f => f.id === e.matchedId)!
      const rate = calcRate(Number(e.fat), Number(e.water), useSNF ? Number(e.snf) : undefined)
      const amount = Number((Number(e.qty) * rate).toFixed(2))

      validEntries.push({
        farmerId: farmer.id,
        farmerName: farmer.name,
        date,
        shift: e.shift,
        qty: Number(e.qty),
        fat: Number(e.fat),
        water: Number(e.water),
        snf: useSNF ? Number(e.snf) : undefined,
        rate,
        amount
      })
    }

    if (validEntries.length === 0) return toast.error('No entries to save')
    onSave(validEntries)
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 rounded-xl flex items-center justify-between gap-3">
        <div className="flex items-start gap-3 text-sm text-amber-800 dark:text-amber-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>Review and confirm the data extracted from your ledger. Ensure every row is matched to a registered farmer.</p>
        </div>
        <button 
          onClick={() => setNewFarmerOpen(true)}
          className="btn-secondary bg-white text-xs py-1.5 whitespace-nowrap shadow-sm border-blue-200 hover:border-blue-400"
        >
          <UserPlus className="w-3.5 h-3.5 text-blue-600" /> New Farmer
        </button>
      </div>

      <div className="table-container max-h-[60vh] overflow-y-auto border rounded-xl shadow-inner bg-slate-50 dark:bg-slate-900/20">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">Farmer Match</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] w-32">Shift</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] w-24">Qty (L)</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] w-24">Fat%</th>
              {useSNF && <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] w-24">SNF%</th>}
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] w-24">Water%</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] w-32">Amount</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] w-16"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-[var(--color-border)]">
            {entries.map((e, i) => {
              const rate = (e.fat !== null && e.water !== null && (!useSNF || e.snf !== null)) ? calcRate(Number(e.fat), Number(e.water), useSNF ? Number(e.snf) : undefined) : 0
              const amount = (e.qty && rate) ? (Number(e.qty) * rate).toFixed(2) : 0
              
              return (
                <tr key={e.tempId} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-4 py-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                        <User className="w-3.5 h-3.5" /> 
                        <span className="font-semibold uppercase tracking-tight">AI Read:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{e.farmerName || '???'}</span>
                      </div>
                      <select 
                        value={e.matchedId} 
                        onChange={val => updateEntry(i, 'matchedId', val.target.value)}
                        className={`input-field py-1.5 text-xs font-medium ${!e.matchedId ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/20' : 'bg-slate-50/50 dark:bg-slate-800/50'}`}
                      >
                        <option value="">-- Match Farmer --</option>
                        {farmers.map(f => (
                          <option key={f.id} value={f.id}>{f.name} ({f.id})</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <select 
                      value={e.shift} 
                      onChange={v => updateEntry(i, 'shift', v.target.value)}
                      className="input-field py-1.5 text-xs font-medium bg-slate-50/50 dark:bg-slate-800/50"
                    >
                      <option value="morning">🌅 Morning</option>
                      <option value="evening">🌆 Evening</option>
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <input 
                      type="number" step="0.1" value={e.qty || ''} 
                      onChange={v => updateEntry(i, 'qty', v.target.value)}
                      className="input-field py-1.5 text-xs font-bold text-center bg-slate-50/50 dark:bg-slate-800/50"
                      placeholder="0.0"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input 
                      type="number" step="0.1" value={e.fat === null ? '' : e.fat} 
                      onChange={v => updateEntry(i, 'fat', v.target.value === '' ? null : Number(v.target.value))}
                      className="input-field py-1.5 text-xs font-bold text-center bg-slate-50/50 dark:bg-slate-800/50"
                      placeholder="0.0"
                    />
                  </td>
                  {useSNF && (
                    <td className="px-4 py-4">
                      <input 
                        type="number" step="0.1" value={e.snf === null ? '' : e.snf} 
                        onChange={v => updateEntry(i, 'snf', v.target.value === '' ? null : Number(v.target.value))}
                        className="input-field py-1.5 text-xs font-bold text-center bg-slate-50/50 dark:bg-slate-800/50"
                        placeholder="0.0"
                      />
                    </td>
                  )}
                  <td className="px-4 py-4">
                    <input 
                      type="number" step="0.1" value={e.water === null ? '' : e.water} 
                      onChange={v => updateEntry(i, 'water', v.target.value === '' ? null : Number(v.target.value))}
                      className="input-field py-1.5 text-xs font-bold text-center bg-slate-50/50 dark:bg-slate-800/50"
                      placeholder="0.0"
                    />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-[var(--color-muted)] font-medium">₹{rate}/L</span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400 text-base">₹{amount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => deleteEntry(i)} className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-2">
        <p className="text-sm text-[var(--color-muted)] font-medium">
          Total Entries: <span className="text-[var(--color-text)]">{entries.length}</span>
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary">Discard</button>
          <button onClick={handleSaveAll} className="btn-primary">
            <CheckCircle2 className="w-4 h-4" /> Save All Collections
          </button>
        </div>
      </div>

      {/* Quick Add Farmer Modal */}
      <Modal open={newFarmerOpen} onClose={() => setNewFarmerOpen(false)} title="Register New Farmer" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Farmer Name *</label>
              <input 
                value={farmerForm.name} 
                onChange={e => setFarmerForm({ ...farmerForm, name: e.target.value })} 
                placeholder="Full Name" className="input-field" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Village *</label>
              <input 
                value={farmerForm.village} 
                onChange={e => setFarmerForm({ ...farmerForm, village: e.target.value })} 
                placeholder="Village" className="input-field" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Phone *</label>
              <input 
                value={farmerForm.phone} 
                onChange={e => setFarmerForm({ ...farmerForm, phone: e.target.value })} 
                placeholder="9876543210" className="input-field" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Cattle Count</label>
              <input 
                type="number" min={1} value={farmerForm.cattle} 
                onChange={e => setFarmerForm({ ...farmerForm, cattle: +e.target.value })} 
                className="input-field" 
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleQuickAddFarmer} className="btn-primary flex-1 justify-center">Add Farmer</button>
            <button onClick={() => setNewFarmerOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
