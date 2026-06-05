'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function markNotifAsRead(notifId: string) {
  await prisma.notification.update({
    where: { id: notifId },
    data: { read: true },
  })

  revalidatePath('/notifications')
  return { success: true }
}

export async function markAllNotifsAsRead() {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  await prisma.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true },
  })

  revalidatePath('/notifications')
  return { success: true }
}

export async function addNotification(data: { type: string; msg: string }) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  await prisma.notification.create({
    data: {
      type: data.type,
      msg: data.msg,
      time: 'Just now',
      read: false,
      userId: session.userId,
    },
  })

  revalidatePath('/notifications')
  return { success: true }
}
