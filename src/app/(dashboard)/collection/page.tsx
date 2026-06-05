'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import StatCard from '@/components/ui/StatCard'
import Modal from '@/components/ui/Modal'
import SearchBar from '@/components/ui/SearchBar'
import LedgerReview from '@/components/collection/LedgerReview'
import { Milk, Plus, Calculator, CheckCircle2, Sun, BookOpen, Camera, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { calcRate } from '@/lib/rateCalculator'

import { addCollection, addBulkCollections } from '@/app/actions/collections'

export default function CollectionPage() {
  const { collections, farmers, todayStr, useSNF } = useApp()
  const [search, setSearch]     = useState('')
  const [shiftFilter, setShift] = useState('all')
  const [dateFilter, setDate]   = useState(todayStr)
  const [addOpen, setAddOpen]   = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [ledgerOpen, setLedgerOpen] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [ledgerData, setLedgerData] = useState<any[] | null>(null)
  
  // Single entry form
  const [form, setForm] = useState({ farmerId:'', shift:'morning' as 'morning' | 'evening', qty:'', fat:'', water:'', snf:'', date: todayStr })
  const [rate, setRate] = useState(0)
  const [amount, setAmount] = useState(0)

  // Bulk entry form
  const [bulkDate, setBulkDate] = useState(todayStr)
  const [bulkShift, setBulkShift] = useState('morning' as 'morning' | 'evening')
  const [bulkEntries, setBulkEntries] = useState<Record<string, { qty?: string, fat?: string, water?: string, snf?: string }>>({})

  const handleLedgerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setParsing(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/parse-ledger', {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()
      if (result.data) {
        setLedgerData(result.data)
      } else {
        toast.error(result.error || 'Failed to parse ledger')
      }
    } catch (err) {
      toast.error('Network error while parsing ledger')
    } finally {
      setParsing(false)
    }
  }

  const handleBulkSave = async (finalData: any[]) => {
    const records = finalData.map(r => ({
      farmerId: r.farmerId,
      farmerName: r.farmerName,
      date: r.date || todayStr,
      shift: r.shift as 'morning' | 'evening',
      qty: +r.qty,
      fat: +r.fat,
      water: +r.water,
      snf: r.snf ? +r.snf : undefined,
    }))
    const res = await addBulkCollections(records)
    if (res.error) {
      return toast.error(res.error)
    }
    toast.success(`${res.count} collections added successfully!`)
    setLedgerOpen(false)
    setLedgerData(null)
  }

  const recalc = (f: { qty: string, fat: string, water: string, snf: string }) => {
    const r = calcRate(+f.fat, +f.water, useSNF ? +f.snf : undefined)
    const a = (+(f.qty) * r).toFixed(2)
    setRate(r); setAmount(+a)
  }

  const updateForm = (key: string, val: string) => {
    const updated = { ...form, [key]: val }
    setForm(updated)
    if (updated.fat && updated.water && updated.qty && (!useSNF || updated.snf)) recalc(updated)
  }

  const handleAdd = async () => {
    if (!form.farmerId || !form.qty || !form.fat || !form.water || (useSNF && !form.snf)) return toast.error('Fill all required fields')
    const farmer = farmers.find(f => f.id === form.farmerId)
    if (!farmer) return toast.error('Farmer not found')
    
    const res = await addCollection({ 
      farmerId: form.farmerId,
      farmerName: farmer.name,
      shift: form.shift,
      qty: +form.qty, 
      fat: +form.fat, 
      water: +form.water, 
      snf: useSNF ? +form.snf : undefined,
      date: form.date 
    })
    if (res.error) {
      return toast.error(Object.values(res.error).flat().join(', '))
    }
    toast.success('Collection recorded!')
    setAddOpen(false)
    setForm({ farmerId:'', shift:'morning', qty:'', fat:'', water:'', snf: '', date: todayStr })
    setRate(0); setAmount(0)
  }

  const updateBulkEntry = (farmerId: string, field: string, val: string) => {
    setBulkEntries(prev => ({
      ...prev,
      [farmerId]: {
        ...prev[farmerId],
        [field]: val
      }
    }))
  }

  const handleBulkSubmit = async () => {
    const records = []
    for (const farmer of farmers) {
      const entry = bulkEntries[farmer.id]
      if (entry && entry.qty && entry.fat && entry.water && (!useSNF || entry.snf)) {
        records.push({
          farmerId: farmer.id,
          farmerName: farmer.name,
          date: bulkDate,
          shift: bulkShift,
          qty: +entry.qty,
          fat: +entry.fat,
          water: +entry.water,
          snf: useSNF ? +(entry.snf || 0) : undefined,
        })
      }
    }
    if (records.length > 0) {
      const res = await addBulkCollections(records)
      if (res.error) {
        return toast.error(res.error)
      }
      toast.success(`${res.count} collections recorded!`)
      setBulkOpen(false)
      setBulkEntries({})
    } else {
      toast.error('No valid entries to save.')
    }
  }

  const filtered = collections.filter(c => {
    const q = search.toLowerCase()
    return (
      (c.farmerName.toLowerCase().includes(q) || c.farmerId.toLowerCase().includes(q)) &&
      (shiftFilter === 'all' || c.shift === shiftFilter) &&
      (dateFilter === '' || c.date === dateFilter)
    )
  }).sort((a, b) => b.date.localeCompare(a.date))

  const todayAll = collections.filter(c => c.date === todayStr)
  const todayMorning = todayAll.filter(c => c.shift === 'morning')
  const todayEvening = todayAll.filter(c => c.shift === 'evening')

  const activeFarmers = farmers.filter(f => f.status === 'active')

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="page-header mb-0">
          <h1 className="flex items-center gap-2"><Milk className="w-6 h-6 text-blue-600" /> Milk Collection</h1>
          <p>Daily milk entry with fat%, SNF, and auto rate calculation</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLedgerOpen(true)} className="btn-secondary text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-50">
            <Camera className="w-4 h-4" /> Upload Ledger
          </button>
          <button onClick={() => setBulkOpen(true)} className="btn-secondary">
            <BookOpen className="w-4 h-4" /> Book Entry
          </button>
          <button id="add-collection-btn" onClick={() => setAddOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Milk}         label="Today Total"   value={`${todayAll.reduce((s,c)=>s+c.qty,0).toFixed(1)} L`}   color="blue"   delay={0}    />
        <StatCard icon={Sun}          label="Morning Shift" value={`${todayMorning.reduce((s,c)=>s+c.qty,0).toFixed(1)} L`} color="orange" delay={0.06} />
        <StatCard icon={CheckCircle2} label="Evening Shift" value={`${todayEvening.reduce((s,c)=>s+c.qty,0).toFixed(1)} L`} color="green"  delay={0.12} />
        <StatCard icon={Calculator}   label="Today Revenue" value={`₹${todayAll.reduce((s,c)=>s+c.amount,0).toLocaleString()}`} color="purple" delay={0.18} />
      </div>

      {/* Table */}
      <div className="section-card">
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search farmer name or ID...">
            <select id="shift-filter" value={shiftFilter} onChange={e=>setShift(e.target.value)} className="input-field w-auto text-sm">
              <option value="all">All Shifts</option>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
            </select>
            <input id="date-filter" type="date" value={dateFilter} onChange={e=>setDate(e.target.value)} className="input-field w-auto text-sm" />
          </SearchBar>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Farmer</th><th>Date</th><th>Shift</th><th>Qty (L)</th><th>Fat%</th>{useSNF && <th>SNF%</th>}<th>Water%</th><th>Rate/L</th><th>Amount</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={useSNF ? 11 : 10} className="text-center py-10 text-[var(--color-muted)]">No collections found</td></tr>
              )}
              {filtered.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.03 }}>
                  <td className="font-mono text-xs text-[var(--color-muted)]">{c.id}</td>
                  <td className="font-semibold text-[var(--color-text)]">{c.farmerName}</td>
                  <td className="text-[var(--color-muted)]">{c.date}</td>
                  <td>
                    <span className={c.shift==='morning' ? 'badge-warning' : 'badge-blue'}>
                      {c.shift === 'morning' ? '🌅 Morning' : '🌆 Evening'}
                    </span>
                  </td>
                  <td className="font-semibold">{c.qty} L</td>
                  <td>{c.fat}%</td>
                  {useSNF && <td>{c.snf ?? '-'}%</td>}
                  <td>{c.water}%</td>
                  <td>₹{c.rate}/L</td>
                  <td className="font-bold text-[var(--color-text)]">₹{c.amount.toLocaleString()}</td>
                  <td><span className={c.status==='accepted'?'badge-success':'badge-warning'}>{c.status}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[var(--color-muted)] mt-3">Showing {filtered.length} entries</p>
      </div>

      {/* Add Entry Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Milk Collection Entry">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Farmer *</label>
            <select id="collection-farmer" value={form.farmerId} onChange={e=>updateForm('farmerId',e.target.value)} className="input-field">
              <option value="">-- Select Farmer --</option>
              {activeFarmers.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.id})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Date *</label>
              <input id="collection-date" type="date" value={form.date} onChange={e=>updateForm('date',e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Shift *</label>
              <select id="collection-shift" value={form.shift} onChange={e=>updateForm('shift',e.target.value)} className="input-field">
                <option value="morning">🌅 Morning</option>
                <option value="evening">🌆 Evening</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Quantity (Litres) *</label>
              <input id="collection-qty" type="number" step="0.1" min="0" value={form.qty} onChange={e=>updateForm('qty',e.target.value)} placeholder="0.0" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Fat % *</label>
              <input id="collection-fat" type="number" step="0.1" min="0" max="10" value={form.fat} onChange={e=>updateForm('fat',e.target.value)} placeholder="4.2" className="input-field" />
            </div>
            {useSNF && (
              <div>
                <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">SNF % *</label>
                <input id="collection-snf" type="number" step="0.1" min="0" max="15" value={form.snf} onChange={e=>updateForm('snf',e.target.value)} placeholder="8.5" className="input-field" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-[var(--color-muted)] block mb-1.5">Water % *</label>
              <input id="collection-water" type="number" step="0.1" min="0" max="100" value={form.water} onChange={e=>updateForm('water',e.target.value)} placeholder="0.0" className="input-field" />
            </div>
          </div>

          {/* Auto-calculated rate preview */}
          {form.fat && form.water && form.qty && (!useSNF || form.snf) && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300 font-semibold text-sm">
                <Calculator className="w-4 h-4" /> Auto Calculation
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><p className="text-xs text-[var(--color-muted)]">Rate / Litre</p><p className="font-bold text-[var(--color-text)]">₹{rate}</p></div>
                <div><p className="text-xs text-[var(--color-muted)]">Quantity</p><p className="font-bold text-[var(--color-text)]">{form.qty} L</p></div>
                <div><p className="text-xs text-[var(--color-muted)]">Total Amount</p><p className="font-bold text-xl text-blue-600 dark:text-blue-400">₹{amount.toLocaleString()}</p></div>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={handleAdd} className="btn-primary flex-1 justify-center">Record Entry</button>
            <button onClick={() => setAddOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Bulk Entry Modal */}
      {bulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--color-surface)] w-full max-w-5xl max-h-full rounded-2xl shadow-xl flex flex-col border border-[var(--color-border)]"
          >
            <div className="p-4 sm:p-6 border-b border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> Book Entry
              </h2>
              <div className="flex items-center gap-4">
                <input type="date" value={bulkDate} onChange={e=>setBulkDate(e.target.value)} className="input-field py-1.5" />
                <select value={bulkShift} onChange={e=>setBulkShift(e.target.value as 'morning' | 'evening')} className="input-field py-1.5">
                  <option value="morning">🌅 Morning</option>
                  <option value="evening">🌆 Evening</option>
                </select>
                <button onClick={() => setBulkOpen(false)} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
                  &times;
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[var(--color-bg)]">
              <div className="table-container bg-[var(--color-surface)]">
                <table>
                  <thead>
                    <tr>
                      <th className="w-16">ID</th>
                      <th>Farmer Name</th>
                      <th className="w-32">Qty (L)</th>
                      <th className="w-32">Fat %</th>
                      {useSNF && <th className="w-32">SNF %</th>}
                      <th className="w-32">Water %</th>
                      <th className="w-32 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeFarmers.map((f, i) => {
                      const entry = bulkEntries[f.id] || {}
                      const qty = entry.qty ?? ''
                      const fat = entry.fat ?? ''
                      const water = entry.water ?? ''
                      const snf = entry.snf ?? ''
                      let amountPreview: string | number = 0
                      if (qty && fat && water && (!useSNF || snf)) {
                        const r = calcRate(+fat, +water, useSNF ? +snf : undefined)
                        amountPreview = (+qty * r).toFixed(2)
                      }
                      return (
                        <tr key={f.id} className="hover:bg-[var(--color-bg)]/50">
                          <td className="font-mono text-xs text-[var(--color-muted)]">{f.id}</td>
                          <td className="font-semibold text-[var(--color-text)]">{f.name}</td>
                          <td>
                            <input type="number" step="0.1" min="0" placeholder="0.0" className="input-field py-1 px-2 text-sm" 
                                   value={qty} onChange={e => updateBulkEntry(f.id, 'qty', e.target.value)} />
                          </td>
                          <td>
                            <input type="number" step="0.1" min="0" placeholder="0.0" className="input-field py-1 px-2 text-sm" 
                                   value={fat} onChange={e => updateBulkEntry(f.id, 'fat', e.target.value)} />
                          </td>
                          {useSNF && (
                            <td>
                              <input type="number" step="0.1" min="0" placeholder="0.0" className="input-field py-1 px-2 text-sm" 
                                     value={snf} onChange={e => updateBulkEntry(f.id, 'snf', e.target.value)} />
                            </td>
                          )}
                          <td>
                            <input type="number" step="0.1" min="0" placeholder="0.0" className="input-field py-1 px-2 text-sm" 
                                   value={water} onChange={e => updateBulkEntry(f.id, 'water', e.target.value)} />
                          </td>
                          <td className="text-right font-bold text-blue-600 dark:text-blue-400">
                            {+amountPreview > 0 ? `₹${amountPreview}` : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-[var(--color-border)] flex items-center justify-end gap-3 flex-shrink-0">
              <button onClick={() => setBulkOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleBulkSubmit} className="btn-primary">
                <CheckCircle2 className="w-4 h-4" /> Save Book Entries
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Ledger Digitization Modal */}
      <Modal open={ledgerOpen} onClose={() => setLedgerOpen(false)} title="Digitize Manual Ledger Photo" size="5xl">
        {!ledgerData ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-2">
              <Camera className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Upload Ledger Image</h3>
              <p className="text-[var(--color-muted)] max-w-md mx-auto">
                Snap a clear photo of your handwritten milk collection register. Gemini AI will extract the data for you.
              </p>
            </div>
            
            <div className="pt-4">
              <label className={`btn-primary cursor-pointer ${parsing ? 'opacity-50 pointer-events-none' : ''}`}>
                {parsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Handwritten Ledger...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Select or Capture Photo
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleLedgerUpload} disabled={parsing} />
              </label>
            </div>
            <p className="text-xs text-[var(--color-muted)] italic">Supported formats: JPG, PNG, WebP</p>
          </div>
        ) : (
          <LedgerReview 
            data={ledgerData} 
            date={todayStr} 
            onSave={handleBulkSave} 
            onCancel={() => setLedgerData(null)} 
          />
        )}
      </Modal>
    </div>
  )
}
