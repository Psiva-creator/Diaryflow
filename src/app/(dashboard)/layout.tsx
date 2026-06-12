import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { getSession } from '@/lib/session'
import {
  getFarmers, getCustomers, getCollectionsWithFarmerDisplayId,
  getPayments, getReceipts, getTanks, getNotifications, getDashboardData
} from '@/lib/queries'
import type { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  // Fetch all data server-side
  const [
    farmers, customers, collections,
    payments, receipts, tanks,
    notifications, dashboardData,
  ] = await Promise.all([
    getFarmers(),
    getCustomers(),
    getCollectionsWithFarmerDisplayId(),
    getPayments(),
    getReceipts(),
    getTanks(),
    getNotifications(),
    getDashboardData(),
  ])

  const unreadNotifs = notifications.filter(n => !n.read).length

  const initialData = {
    user: {
      name: session.name,
      role: session.role as 'admin' | 'staff',
      avatar: session.avatar,
      dairyCode: session.dairyCode,
    },
    farmers,
    customers,
    collections,
    payments,
    receipts,
    tanks,
    notifications,
    unreadNotifs,
    ...dashboardData,
  }

  return <AppShell initialData={initialData}>{children}</AppShell>
}
