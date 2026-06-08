// ── Domain Types ──────────────────────────────────────────────────────────────

export interface Farmer {
  id: string
  name: string
  village: string
  phone: string
  cattle: number
  customPricing?: boolean
  includesSnf?: boolean
  status: 'active' | 'inactive'
  joinDate: string
  balance: number
}

export interface Customer {
  id: string
  name: string
  type: 'retail' | 'bulk' | 'subscription'
  phone: string
  address: string
  dailyQty: number
  status: 'active' | 'inactive'
  balance: number
}

export interface Collection {
  id: string
  farmerId: string
  farmerName: string
  date: string
  shift: 'morning' | 'evening'
  qty: number
  fat: number
  water: number
  snf?: number
  rate: number
  amount: number
  status: 'accepted' | 'pending'
}

export interface Payment {
  id: string
  farmerId: string
  farmerName: string
  amount: number
  date: string
  method: 'cash' | 'bank' | 'upi' | 'cheque'
  status: 'paid' | 'pending'
  note: string
}

export interface Receipt {
  id: string
  paymentId: string
  farmerId: string
  farmerName: string
  amount: number
  date: string
  paidDate: string
  method: 'cash' | 'bank' | 'upi' | 'cheque'
  note: string
}

export interface Tank {
  id: string
  name: string
  capacity: number
  current: number
  temp: number
  status: 'operational' | 'maintenance'
  lastCleaned: string
}

export interface Notification {
  id: number
  type: 'payment' | 'collection' | 'maintenance'
  msg: string
  time: string
  read: boolean
}

export interface User {
  name: string
  role: 'admin' | 'staff'
  avatar: string
}

// ── Rate Table ────────────────────────────────────────────────────────────────

export type FatRange = '3.0-3.4' | '3.5-3.9' | '4.0-4.4' | '4.5-4.9' | '5.0+'
export type SNFRange = 'below 8' | '8-8.5' | 'above 8.5'
export type RateTable = Record<FatRange, number>
export type RateTable2D = Record<FatRange, Record<SNFRange, number>>

// ── Form Data Types ──────────────────────────────────────────────────────────

export interface FarmerFormData {
  name: string
  village: string
  phone: string
  cattle: number
  customPricing?: boolean
  includesSnf?: boolean
}

export interface CustomerFormData {
  name: string
  type: 'retail' | 'bulk' | 'subscription'
  phone: string
  address: string
  dailyQty: number
}

export interface CollectionFormData {
  farmerId: string
  shift: 'morning' | 'evening'
  qty: string
  fat: string
  water: string
  snf?: string
  date: string
}

export interface PaymentFormData {
  farmerId: string
  amount: string
  method: 'cash' | 'bank' | 'upi' | 'cheque'
  note: string
}

// ── Analytics Types ──────────────────────────────────────────────────────────

export interface DayData {
  date: string
  morning: number
  evening: number
  total: number
  revenue: number
}

export interface FatDistEntry {
  range: string
  count: number
}

// ── Context Value ────────────────────────────────────────────────────────────

export interface AppContextValue {
  theme: string
  toggleTheme: () => void
  user: User
  useSNF: boolean
  setUseSNF: (val: boolean) => void
  farmers: Farmer[]
  addFarmer: (data: FarmerFormData) => void
  updateFarmer: (id: string, data: Partial<FarmerFormData>) => void
  deleteFarmer: (id: string) => void
  customers: Customer[]
  addCustomer: (data: CustomerFormData) => void
  updateCustomer: (id: string, data: Partial<CustomerFormData>) => void
  deleteCustomer: (id: string) => void
  collections: Collection[]
  addCollection: (data: Omit<Collection, 'id' | 'status'>) => void
  addBulkCollections: (data: Omit<Collection, 'id' | 'status'>[]) => void
  payments: Payment[]
  addPayment: (data: Omit<Payment, 'id'>) => void
  markPaymentPaid: (id: string) => void
  receipts: Receipt[]
  tanks: Tank[]
  setTanks: React.Dispatch<React.SetStateAction<Tank[]>>
  notifications: Notification[]
  unreadNotifs: number
  addNotification: (notif: Omit<Notification, 'id'>) => void
  markNotifAsRead: (id: number) => void
  rateTable: RateTable
  todayCollections: Collection[]
  totalMilkToday: number
  revenueToday: number
  pendingPayments: number
  activeFarmers: number
  last7Days: DayData[]
  fatDist: FatDistEntry[]
  todayStr: string
}
