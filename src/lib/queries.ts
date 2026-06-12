import 'server-only'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import type { Farmer, Customer, Collection, Payment, Receipt, Tank, Notification, DayData, FatDistEntry } from '@/types'

// ── Utility ──────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0]

const daysAgo = (n: number): string => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

async function requireUserId(): Promise<string> {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session.adminId || session.userId
}

// ── Farmers ──────────────────────────────────────────────────────────────────
export async function getFarmers(): Promise<Farmer[]> {
  const userId = await requireUserId()
  const farmers = await prisma.farmer.findMany({
    where: { userId },
    orderBy: { displayId: 'asc' },
  })
  return farmers.map(f => ({
    id: f.displayId,
    name: f.name,
    village: f.village,
    phone: f.phone,
    cattle: f.cattle,
    status: f.status as 'active' | 'inactive',
    joinDate: f.joinDate,
    balance: f.balance,
  }))
}

// ── Customers ────────────────────────────────────────────────────────────────
export async function getCustomers(): Promise<Customer[]> {
  const userId = await requireUserId()
  const customers = await prisma.customer.findMany({
    where: { userId },
    orderBy: { displayId: 'asc' },
  })
  return customers.map(c => ({
    id: c.displayId,
    name: c.name,
    type: c.type as 'retail' | 'bulk' | 'subscription',
    phone: c.phone,
    address: c.address,
    dailyQty: c.dailyQty,
    status: c.status as 'active' | 'inactive',
    balance: c.balance,
  }))
}

// ── Collections ──────────────────────────────────────────────────────────────
export async function getCollections(): Promise<Collection[]> {
  const userId = await requireUserId()
  const collections = await prisma.collection.findMany({
    where: { userId },
    include: { farmer: { select: { displayId: true } } },
    orderBy: { displayId: 'asc' },
  })
  return collections.map(c => ({
    id: c.displayId,
    farmerId: c.farmer.displayId,
    farmerName: c.farmerName,
    date: c.date,
    shift: c.shift as 'morning' | 'evening',
    qty: c.qty,
    fat: c.fat,
    water: c.water,
    snf: c.snf ?? undefined,
    rate: c.rate,
    amount: c.amount,
    status: c.status as 'accepted' | 'pending',
  }))
}

// Resolve farmerId to displayId for collections
export async function getCollectionsWithFarmerDisplayId(): Promise<Collection[]> {
  const userId = await requireUserId()
  const collections = await prisma.collection.findMany({
    where: { userId },
    include: { farmer: { select: { displayId: true } } },
    orderBy: { displayId: 'asc' },
  })
  return collections.map(c => ({
    id: c.displayId,
    farmerId: c.farmer.displayId,
    farmerName: c.farmerName,
    date: c.date,
    shift: c.shift as 'morning' | 'evening',
    qty: c.qty,
    fat: c.fat,
    water: c.water,
    snf: c.snf ?? undefined,
    rate: c.rate,
    amount: c.amount,
    status: c.status as 'accepted' | 'pending',
  }))
}

// ── Payments ─────────────────────────────────────────────────────────────────
export async function getPayments(): Promise<Payment[]> {
  const userId = await requireUserId()
  const payments = await prisma.payment.findMany({
    where: { userId },
    include: { farmer: { select: { displayId: true } } },
    orderBy: { displayId: 'asc' },
  })
  return payments.map(p => ({
    id: p.displayId,
    farmerId: p.farmer.displayId,
    farmerName: p.farmerName,
    amount: p.amount,
    date: p.date,
    method: p.method as 'cash' | 'bank' | 'upi' | 'cheque',
    status: p.status as 'paid' | 'pending',
    note: p.note,
  }))
}

// ── Receipts ─────────────────────────────────────────────────────────────────
export async function getReceipts(): Promise<Receipt[]> {
  const userId = await requireUserId()
  const receipts = await prisma.receipt.findMany({
    where: { userId },
    include: {
      farmer: { select: { displayId: true } },
      payment: { select: { displayId: true } },
    },
    orderBy: { displayId: 'asc' },
  })
  return receipts.map(r => ({
    id: r.displayId,
    paymentId: r.payment.displayId,
    farmerId: r.farmer.displayId,
    farmerName: r.farmerName,
    amount: r.amount,
    date: r.date,
    paidDate: r.paidDate,
    method: r.method as 'cash' | 'bank' | 'upi' | 'cheque',
    note: r.note,
  }))
}

// ── Tanks ────────────────────────────────────────────────────────────────────
export async function getTanks(): Promise<Tank[]> {
  const userId = await requireUserId()
  const tanks = await prisma.tank.findMany({
    where: { userId },
    orderBy: { displayId: 'asc' },
  })
  return tanks.map(t => ({
    id: t.displayId,
    name: t.name,
    capacity: t.capacity,
    current: t.current,
    temp: t.temp,
    status: t.status as 'operational' | 'maintenance',
    lastCleaned: t.lastCleaned,
  }))
}

// ── Notifications ────────────────────────────────────────────────────────────
export async function getNotifications(): Promise<Notification[]> {
  const session = await getSession()
  if (!session) return []

  const notifs = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { id: 'desc' },
  })
  return notifs.map((n, i) => ({
    id: i + 1, // numeric id for compatibility
    type: n.type as 'payment' | 'collection' | 'maintenance',
    msg: n.msg,
    time: n.time,
    read: n.read,
    _dbId: n.id, // real DB id for mutations
  })) as (Notification & { _dbId: string })[]
}

// ── Dashboard Analytics ──────────────────────────────────────────────────────
export async function getDashboardData() {
  const userId = await requireUserId()
  const today = todayStr()

  // Today's collections
  const todayCollections = await prisma.collection.findMany({
    where: { userId, date: today },
    include: { farmer: { select: { displayId: true } } },
  })

  const totalMilkToday = todayCollections.reduce((s, c) => s + c.qty, 0)
  const revenueToday = todayCollections.reduce((s, c) => s + c.amount, 0)

  // Pending payments
  const pendingResult = await prisma.payment.aggregate({
    where: { userId, status: 'pending' },
    _sum: { amount: true },
  })
  const pendingPayments = pendingResult._sum.amount ?? 0

  // Active farmers count
  const activeFarmers = await prisma.farmer.count({
    where: { userId, status: 'active' },
  })

  // Last 7 days
  const last7Days: DayData[] = []
  for (let i = 6; i >= 0; i--) {
    const d = daysAgo(i)
    const cols = await prisma.collection.findMany({ where: { userId, date: d } })
    last7Days.push({
      date: d.slice(5),
      morning: cols.filter(c => c.shift === 'morning').reduce((s, c) => s + c.qty, 0),
      evening: cols.filter(c => c.shift === 'evening').reduce((s, c) => s + c.qty, 0),
      total: cols.reduce((s, c) => s + c.qty, 0),
      revenue: cols.reduce((s, c) => s + c.amount, 0),
    })
  }

  // Fat distribution
  const allCollections = await prisma.collection.findMany({
    where: { userId },
    select: { fat: true },
  })
  const fatDist: FatDistEntry[] = [
    { range: '3.0-3.5', count: allCollections.filter(c => c.fat >= 3.0 && c.fat < 3.5).length },
    { range: '3.5-4.0', count: allCollections.filter(c => c.fat >= 3.5 && c.fat < 4.0).length },
    { range: '4.0-4.5', count: allCollections.filter(c => c.fat >= 4.0 && c.fat < 4.5).length },
    { range: '4.5-5.0', count: allCollections.filter(c => c.fat >= 4.5 && c.fat < 5.0).length },
    { range: '5.0+',    count: allCollections.filter(c => c.fat >= 5.0).length },
  ]

  // Map today's collections to UI format
  const todayCollectionsMapped: Collection[] = todayCollections.map(c => ({
    id: c.displayId,
    farmerId: c.farmer.displayId,
    farmerName: c.farmerName,
    date: c.date,
    shift: c.shift as 'morning' | 'evening',
    qty: c.qty,
    fat: c.fat,
    water: c.water,
    snf: c.snf ?? undefined,
    rate: c.rate,
    amount: c.amount,
    status: c.status as 'accepted' | 'pending',
  }))

  return {
    todayCollections: todayCollectionsMapped,
    totalMilkToday,
    revenueToday,
    pendingPayments,
    activeFarmers,
    last7Days,
    fatDist,
    todayStr: today,
  }
}
