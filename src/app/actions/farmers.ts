'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { farmerSchema } from '@/lib/schemas'
import type { FarmerFormData } from '@/types'
import { getSession } from '@/lib/session'

export async function addFarmer(data: FarmerFormData) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const parsed = farmerSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // Generate next display ID scoped to this user
  const lastFarmer = await prisma.farmer.findFirst({
    where: { userId: session.userId },
    orderBy: { displayId: 'desc' },
  })
  const lastNum = lastFarmer
    ? parseInt(lastFarmer.displayId.replace('F', ''), 10)
    : 0
  const displayId = `F${String(lastNum + 1).padStart(3, '0')}`

  const today = new Date().toISOString().split('T')[0]

  await prisma.farmer.create({
    data: {
      displayId,
      name: parsed.data.name,
      village: parsed.data.village,
      phone: parsed.data.phone,
      cattle: parsed.data.cattle,
      customPricing: parsed.data.customPricing ?? false,
      includesSnf: parsed.data.includesSnf ?? false,
      status: 'active',
      joinDate: today,
      balance: 0,
      userId: session.userId,
    },
  })

  revalidatePath('/farmers')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function addFarmersBulk(rows: FarmerFormData[]) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const validRows = rows.filter(r => {
    const parsed = farmerSchema.safeParse(r)
    return parsed.success
  })

  if (validRows.length === 0) {
    return { error: 'No valid entries found' }
  }

  // Get the last display ID for this user
  const lastFarmer = await prisma.farmer.findFirst({
    where: { userId: session.userId },
    orderBy: { displayId: 'desc' },
  })
  let lastNum = lastFarmer
    ? parseInt(lastFarmer.displayId.replace('F', ''), 10)
    : 0

  const today = new Date().toISOString().split('T')[0]

  for (const row of validRows) {
    lastNum++
    await prisma.farmer.create({
      data: {
        displayId: `F${String(lastNum).padStart(3, '0')}`,
        name: row.name,
        village: row.village,
        phone: row.phone,
        cattle: row.cattle,
        customPricing: row.customPricing ?? false,
        includesSnf: row.includesSnf ?? false,
        status: 'active',
        joinDate: today,
        balance: 0,
        userId: session.userId,
      },
    })
  }

  revalidatePath('/farmers')
  revalidatePath('/dashboard')
  return { success: true, count: validRows.length }
}

export async function updateFarmer(displayId: string, data: Partial<FarmerFormData>) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const farmer = await prisma.farmer.findFirst({
    where: { displayId, userId: session.userId },
  })
  if (!farmer) return { error: 'Farmer not found' }

  await prisma.farmer.update({
    where: { id: farmer.id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.village !== undefined && { village: data.village }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.cattle !== undefined && { cattle: data.cattle }),
      ...(data.customPricing !== undefined && { customPricing: data.customPricing }),
      ...(data.includesSnf !== undefined && { includesSnf: data.includesSnf }),
    },
  })

  revalidatePath('/farmers')
  return { success: true }
}

export async function deleteFarmer(displayId: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const farmer = await prisma.farmer.findFirst({
    where: { displayId, userId: session.userId },
  })
  if (!farmer) return { error: 'Farmer not found' }

  await prisma.farmer.delete({ where: { id: farmer.id } })

  revalidatePath('/farmers')
  revalidatePath('/dashboard')
  return { success: true }
}
