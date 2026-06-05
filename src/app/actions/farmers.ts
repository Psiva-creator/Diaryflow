'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { farmerSchema } from '@/lib/schemas'
import type { FarmerFormData } from '@/types'

export async function addFarmer(data: FarmerFormData) {
  const parsed = farmerSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // Generate next display ID
  const lastFarmer = await prisma.farmer.findFirst({
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
      status: 'active',
      joinDate: today,
      balance: 0,
    },
  })

  revalidatePath('/farmers')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function addFarmersBulk(rows: FarmerFormData[]) {
  const validRows = rows.filter(r => {
    const parsed = farmerSchema.safeParse(r)
    return parsed.success
  })

  if (validRows.length === 0) {
    return { error: 'No valid entries found' }
  }

  // Get the last display ID
  const lastFarmer = await prisma.farmer.findFirst({
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
        status: 'active',
        joinDate: today,
        balance: 0,
      },
    })
  }

  revalidatePath('/farmers')
  revalidatePath('/dashboard')
  return { success: true, count: validRows.length }
}

export async function updateFarmer(displayId: string, data: Partial<FarmerFormData>) {
  const farmer = await prisma.farmer.findUnique({ where: { displayId } })
  if (!farmer) return { error: 'Farmer not found' }

  await prisma.farmer.update({
    where: { displayId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.village !== undefined && { village: data.village }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.cattle !== undefined && { cattle: data.cattle }),
    },
  })

  revalidatePath('/farmers')
  return { success: true }
}

export async function deleteFarmer(displayId: string) {
  const farmer = await prisma.farmer.findUnique({ where: { displayId } })
  if (!farmer) return { error: 'Farmer not found' }

  await prisma.farmer.delete({ where: { displayId } })

  revalidatePath('/farmers')
  revalidatePath('/dashboard')
  return { success: true }
}
