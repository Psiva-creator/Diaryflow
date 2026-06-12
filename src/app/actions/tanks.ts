'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function updateTank(displayId: string, data: { current?: number; temp?: number; status?: string; lastCleaned?: string }) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const tank = await prisma.tank.findFirst({
    where: { displayId, userId: session.userId },
  })
  if (!tank) return { error: 'Tank not found' }

  await prisma.tank.update({
    where: { id: tank.id },
    data: {
      ...(data.current !== undefined && { current: data.current }),
      ...(data.temp !== undefined && { temp: data.temp }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.lastCleaned !== undefined && { lastCleaned: data.lastCleaned }),
    },
  })

  revalidatePath('/inventory')
  return { success: true }
}
