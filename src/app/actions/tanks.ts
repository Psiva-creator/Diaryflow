'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'

export async function updateTank(displayId: string, data: { current?: number; temp?: number; status?: string; lastCleaned?: string }) {
  const tank = await prisma.tank.findUnique({ where: { displayId } })
  if (!tank) return { error: 'Tank not found' }

  await prisma.tank.update({
    where: { displayId },
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
