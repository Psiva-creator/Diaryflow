import React from 'react'
import { Milk, Calendar, User, MapPin } from 'lucide-react'
import type { Collection, Farmer, Payment } from '@/types'
import { calcRate } from '@/lib/rateCalculator'

interface FarmerPassbookProps {
  farmer: Farmer
  collections: Collection[]
  payments: Payment[]
  startDate: string
  endDate: string
  useSNF: boolean
}

export default function FarmerPassbook({ farmer, collections, payments, startDate, endDate, useSNF }: FarmerPassbookProps) {
  // Calculate Farmer's Average Fat for entries where fat is provided (> 0)
  const validFatCols = collections.filter(c => c.fat > 0)
  const farmerAvgFat = validFatCols.length > 0 
    ? validFatCols.reduce((s, c) => s + c.fat, 0) / validFatCols.length 
    : 4.0 // Default fallback if no fat entered at all

  // Group collections and apply average fat fallback
  const groupedData = collections.reduce((acc, c) => {
    const entry = { ...c }
    
    // If fat is not entered (0), use the farmer's average
    if (entry.fat === 0 || !entry.fat) {
      entry.fat = farmerAvgFat
    }
    // Always use the canonical rate calculator for consistency
    const computedRate = calcRate(entry.fat, entry.water, entry.snf)
    if (computedRate > 0) {
      entry.rate = computedRate
      entry.amount = Math.round(entry.qty * computedRate * 100) / 100
    }

    if (!acc[entry.date]) acc[entry.date] = { date: entry.date, morning: null, evening: null }
    if (entry.shift === 'morning') acc[entry.date].morning = entry
    else acc[entry.date].evening = entry
    return acc
  }, {} as Record<string, { date: string, morning: Collection | null, evening: Collection | null }>)

  const sortedDates = Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date))
  
  const processedCollections = sortedDates.flatMap(d => [d.morning, d.evening].filter(Boolean) as Collection[])
  const totalMilkAmount = processedCollections.reduce((s, c) => s + c.amount, 0)
  const totalQty = processedCollections.reduce((s, c) => s + c.qty, 0)
  
  const totalAdvances = payments.reduce((s, p) => s + p.amount, 0)
  const netPayable = totalMilkAmount - totalAdvances

  return (
    <div className="bg-white text-slate-900 border-[2px] border-slate-300 rounded-lg overflow-hidden print:border-slate-400 print:m-0 mb-6 page-break-after-always shadow-md print:shadow-none">
      {/* Header Section - Compact */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-3 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase">Milk Passbook</h1>
            <p className="text-blue-200 text-[9px] font-bold uppercase tracking-widest">{farmer.name} ({farmer.id}) • {farmer.village}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-blue-200 uppercase">Statement Period</p>
            <p className="text-sm font-black">{startDate} - {endDate}</p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Table Section - Highly Compact */}
      <div className="p-0">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            {/* Main Header */}
            <tr className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-slate-500">
              <th rowSpan={2} className="border-r border-slate-300 px-1 py-1 text-center w-16">Date</th>
              <th colSpan={useSNF ? 4 : 3} className="border-r border-slate-300 px-1 py-0.5 text-center bg-orange-50 text-orange-700 text-[9px]">Morning Shift</th>
              <th colSpan={useSNF ? 4 : 3} className="border-r border-slate-300 px-1 py-0.5 text-center bg-blue-50 text-blue-700 text-[9px]">Evening Shift</th>
              <th rowSpan={2} className="px-1 py-1 text-right bg-slate-50 text-slate-900 w-24">Daily Total</th>
            </tr>
            {/* Sub Header */}
            <tr className="bg-slate-50 border-b border-slate-300 font-bold uppercase text-[8px]">
              {/* Morning Columns */}
              <th className="border-r border-slate-200 px-1 py-1 text-right bg-orange-50/30">Qty</th>
              <th className="border-r border-slate-200 px-1 py-1 text-right bg-orange-50/30">Fat</th>
              {useSNF && <th className="border-r border-slate-200 px-1 py-1 text-right bg-orange-50/30">SNF</th>}
              <th className="border-r border-slate-300 px-1 py-1 text-right bg-orange-50/30">Amt</th>
              {/* Evening Columns */}
              <th className="border-r border-slate-200 px-1 py-1 text-right bg-blue-50/30">Qty</th>
              <th className="border-r border-slate-200 px-2 py-1 text-right bg-blue-50/30">Fat</th>
              {useSNF && <th className="border-r border-slate-200 px-2 py-1 text-right bg-blue-50/30">SNF</th>}
              <th className="border-r border-slate-300 px-1 py-1 text-right bg-blue-50/30">Amt</th>
            </tr>
          </thead>
          <tbody>
            {sortedDates.map((day, i) => {
              const dailyTotal = (day.morning?.amount || 0) + (day.evening?.amount || 0)
              return (
                <tr key={day.date} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} border-b border-slate-200 leading-none`}>
                  <td className="border-r border-slate-200 px-1 py-1 text-center font-black !text-black" style={{ color: '#000000' }}>{day.date.slice(5)}</td>
                  
                  {/* Morning Data */}
                  <td className="border-r border-slate-100 px-1 py-1 text-right !text-black font-black" style={{ color: '#000000' }}>{day.morning?.qty.toFixed(1) || '-'}</td>
                  <td className="border-r border-slate-100 px-1 py-1 text-right !text-black font-black" style={{ color: '#000000' }}>{day.morning?.fat.toFixed(1) || '-'}</td>
                  {useSNF && <td className="border-r border-slate-100 px-1 py-1 text-right !text-black font-black" style={{ color: '#000000' }}>{day.morning?.snf?.toFixed(1) || '-'}</td>}
                  <td className="border-r border-slate-300 px-1 py-1 text-right font-black text-orange-800 italic" style={{ color: '#c2410c' }}>₹{day.morning?.amount.toFixed(0) || '0'}</td>
                  
                  {/* Evening Data */}
                  <td className="border-r border-slate-100 px-1 py-1 text-right !text-black font-black" style={{ color: '#000000' }}>{day.evening?.qty.toFixed(1) || '-'}</td>
                  <td className="border-r border-slate-100 px-1 py-1 text-right !text-black font-black" style={{ color: '#000000' }}>{day.evening?.fat.toFixed(1) || '-'}</td>
                  {useSNF && <td className="border-r border-slate-100 px-1 py-1 text-right !text-black font-black" style={{ color: '#000000' }}>{day.evening?.snf?.toFixed(1) || '-'}</td>}
                  <td className="border-r border-slate-300 px-1 py-1 text-right font-black text-blue-800 italic" style={{ color: '#1e40af' }}>₹{day.evening?.amount.toFixed(0) || '0'}</td>

                  {/* Daily Total */}
                  <td className="px-1 py-1 text-right font-black !text-black bg-slate-50" style={{ color: '#000000' }}>
                    ₹{dailyTotal.toFixed(0)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 border-t border-slate-300 font-bold text-[9px] text-slate-700">
              <td className="px-1 py-2 text-center border-r border-slate-300">TOTAL</td>
              <td colSpan={useSNF ? 4 : 3} className="px-1 py-2 text-center border-r border-slate-300 bg-orange-50/50">
                {collections.filter(c => c.shift === 'morning').reduce((s, c) => s + c.qty, 0).toFixed(1)} L
              </td>
              <td colSpan={useSNF ? 4 : 3} className="px-1 py-2 text-center border-r border-slate-300 bg-blue-50/50">
                {collections.filter(c => c.shift === 'evening').reduce((s, c) => s + c.qty, 0).toFixed(1)} L
              </td>
              <td className="px-1 py-2 text-right text-slate-900">
                ₹{totalMilkAmount.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Advance / Deductions Section */}
      <div className="border-t border-slate-300">
        <div className="grid grid-cols-2 divide-x divide-slate-300">
          <div className="p-2 space-y-1">
            <h4 className="text-[9px] font-black uppercase text-slate-500 mb-2">Mid-Cycle Advances (Deductions)</h4>
            {payments.length === 0 ? (
              <p className="text-[9px] text-slate-400 italic">No advances taken in this period.</p>
            ) : (
              <div className="space-y-1 max-h-[80px] overflow-y-auto">
                {payments.map(p => (
                  <div key={p.id} className="flex justify-between text-[9px] border-b border-slate-100 pb-1">
                    <span className="text-slate-600">{p.date} - {p.method.toUpperCase()} ({p.note || 'Advance'})</span>
                    <span className="font-bold text-red-600">-₹{p.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-3 bg-slate-50 flex flex-col justify-center items-end">
            <div className="space-y-1 text-right">
              <div className="flex justify-between gap-12 text-[10px]">
                <span className="text-slate-500 font-bold uppercase">Milk Total:</span>
                <span className="font-black text-slate-900">₹{totalMilkAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between gap-12 text-[10px]">
                <span className="text-red-500 font-bold uppercase">Advances:</span>
                <span className="font-black text-red-600">-₹{totalAdvances.toLocaleString()}</span>
              </div>
              <div className="border-t-2 border-slate-300 pt-1 mt-1 flex justify-between gap-12 text-sm">
                <span className="text-blue-700 font-black uppercase">Net Payable:</span>
                <span className="font-black text-blue-800 text-lg">₹{netPayable.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section - Compact */}
      <div className="p-2 px-4 flex justify-between items-center bg-slate-50 border-t border-slate-200">
        <div className="text-[8px] text-slate-400 italic">Verified Computer Statement</div>
        <div className="flex gap-6 text-center">
          <div>
            <div className="border-b border-slate-300 w-16 mx-auto mb-1"></div>
            <p className="text-[7px] font-black text-slate-500 uppercase">Farmer</p>
          </div>
          <div>
            <div className="border-b border-slate-300 w-16 mx-auto mb-1"></div>
            <p className="text-[7px] font-black text-slate-500 uppercase">Seal</p>
          </div>
        </div>
      </div>
    </div>
  )
}
