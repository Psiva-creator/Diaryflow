'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { collectionSchema } from '@/lib/schemas'
import { calcRate } from '@/lib/rateCalculator'
import { getSession } from '@/lib/session'

interface AddCollectionInput {
  farmerId: string       // display ID like "F001"
  farmerName: string
  shift: 'morning' | 'evening'
  qty: number
  fat: number
  water: number
  snf?: number
  date: string
}

export async function addCollection(data: AddCollectionInput) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const parsed = collectionSchema.safeParse({
    farmerId: data.farmerId,
    shift: data.shift,
    qty: data.qty,
    fat: data.fat,
    water: data.water,
    snf: data.snf,
    date: data.date,
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // Find farmer by display ID scoped to this user
  const farmer = await prisma.farmer.findFirst({
    where: { displayId: data.farmerId, userId: session.effectiveUserId },
  })
  if (!farmer) return { error: 'Farmer not found' }

  // Calculate rate
  const rate = calcRate(data.fat, data.water, data.snf)
  const amount = Math.round(data.qty * rate * 100) / 100

  // Generate next display ID scoped to this user
  const lastCol = await prisma.collection.findFirst({
    where: { userId: session.effectiveUserId },
    orderBy: { displayId: 'desc' },
  })
  const lastNum = lastCol
    ? parseInt(lastCol.displayId.replace('MC', ''), 10)
    : 0
  const displayId = `MC${String(lastNum + 1).padStart(4, '0')}`

  // Use a transaction for atomicity
  await prisma.$transaction(async (tx) => {
    // Create collection
    await tx.collection.create({
      data: {
        displayId,
        farmerId: farmer.id,
        farmerName: data.farmerName || farmer.name,
        date: data.date,
        shift: data.shift,
        qty: data.qty,
        fat: data.fat,
        water: data.water,
        snf: data.snf,
        rate,
        amount,
        status: 'accepted',
        userId: session.effectiveUserId,
      },
    })

    // Update farmer balance
    await tx.farmer.update({
      where: { id: farmer.id },
      data: { balance: { increment: amount } },
    })

    // Assign to tank with most available capacity (scoped to user)
    const tanks = await tx.tank.findMany({
      where: { userId: session.effectiveUserId, status: 'operational' },
    })
    const candidates = tanks.filter(t => (t.current + data.qty) <= t.capacity)
    if (candidates.length > 0) {
      const target = candidates.reduce((best: any, t: any) => {
        const bestSpace = best.capacity - best.current
        const tSpace = t.capacity - t.current
        return tSpace > bestSpace ? t : best
      })
      await tx.tank.update({
        where: { id: target.id },
        data: { current: { increment: data.qty } },
      })
    }
  })

  revalidatePath('/collection')
  revalidatePath('/dashboard')
  revalidatePath('/inventory')
  revalidatePath('/farmers')
  return { success: true, rate, amount }
}

export async function addBulkCollections(records: AddCollectionInput[]): Promise<{ success: boolean; count: number; error?: string }> {
  let successCount = 0

  for (const data of records) {
    const result = await addCollection(data)
    if ('success' in result && result.success) successCount++
  }

  revalidatePath('/collection')
  revalidatePath('/dashboard')
  revalidatePath('/inventory')
  revalidatePath('/farmers')
  return { success: true, count: successCount }
}
