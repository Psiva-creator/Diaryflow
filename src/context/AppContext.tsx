'use client'
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { BASE_FAT_RATES, RATE_TABLE_2D } from '@/lib/rateCalculator'
import type {
  Farmer, Customer, Collection, Payment, Receipt, Tank, Notification, User,
  FarmerFormData, CustomerFormData, AppContextValue, DayData, FatDistEntry
} from '@/types'

const AppContext = createContext<AppContextValue | null>(null)

/** Props hydrated from server-side queries */
export interface AppProviderProps {
  children: ReactNode
  initialData: {
    user: User
    farmers: Farmer[]
    customers: Customer[]
    collections: Collection[]
    payments: Payment[]
    receipts: Receipt[]
    tanks: Tank[]
    notifications: Notification[]
    todayCollections: Collection[]
    totalMilkToday: number
    revenueToday: number
    pendingPayments: number
    activeFarmers: number
    last7Days: DayData[]
    fatDist: FatDistEntry[]
    todayStr: string
    unreadNotifs: number
  }
}

export function AppProvider({ children, initialData }: AppProviderProps) {
  const [theme, setTheme] = useState('light')
  const [useSNF, setUseSNF] = useState(false)

  // Theme persistence
  useEffect(() => {
    const saved = localStorage.getItem('dairy-theme') || 'light'
    // eslint-disable-next-line
    setTheme(saved)
    document.documentElement.classList.toggle('dark', saved === 'dark')
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('dairy-theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      return next
    })
  }, [])

  // All data comes from server via initialData props.
  // Mutation functions are stubs — pages call server actions directly.
  const noop = () => {}

  const value: AppContextValue = {
    theme, toggleTheme,
    user: initialData.user,
    useSNF, setUseSNF,

    // Read-only data from server
    farmers: initialData.farmers,
    addFarmer: noop as any,
    updateFarmer: noop as any,
    deleteFarmer: noop as any,

    customers: initialData.customers,
    addCustomer: noop as any,
    updateCustomer: noop as any,
    deleteCustomer: noop as any,

    collections: initialData.collections,
    addCollection: noop as any,
    addBulkCollections: noop as any,

    payments: initialData.payments,
    addPayment: noop as any,
    markPaymentPaid: noop as any,

    receipts: initialData.receipts,

    tanks: initialData.tanks,
    setTanks: noop as any,

    notifications: initialData.notifications,
    unreadNotifs: initialData.unreadNotifs,
    addNotification: noop as any,
    markNotifAsRead: noop as any,

    rateTable: (useSNF ? RATE_TABLE_2D : BASE_FAT_RATES) as any,

    // Analytics (pre-computed on server)
    todayCollections: initialData.todayCollections,
    totalMilkToday: initialData.totalMilkToday,
    revenueToday: initialData.revenueToday,
    pendingPayments: initialData.pendingPayments,
    activeFarmers: initialData.activeFarmers,
    last7Days: initialData.last7Days,
    fatDist: initialData.fatDist,
    todayStr: initialData.todayStr,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
