'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { customerSchema } from '@/lib/schemas'
import type { CustomerFormData } from '@/types'

export async function addCustomer(data: CustomerFormData) {
  const parsed = customerSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const lastCustomer = await prisma.customer.findFirst({
    orderBy: { displayId: 'desc' },
  })
  const lastNum = lastCustomer
    ? parseInt(lastCustomer.displayId.replace('C', ''), 10)
    : 0
  const displayId = `C${String(lastNum + 1).padStart(3, '0')}`

  await prisma.customer.create({
    data: {
      displayId,
      name: parsed.data.name,
      type: parsed.data.type,
      phone: parsed.data.phone,
      address: parsed.data.address || '',
      dailyQty: parsed.data.dailyQty,
      status: 'active',
      balance: 0,
    },
  })

  revalidatePath('/customers')
  return { success: true }
}

export async function updateCustomer(displayId: string, data: Partial<CustomerFormData>) {
  const customer = await prisma.customer.findUnique({ where: { displayId } })
  if (!customer) return { error: 'Customer not found' }

  await prisma.customer.update({
    where: { displayId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.dailyQty !== undefined && { dailyQty: data.dailyQty }),
    },
  })

  revalidatePath('/customers')
  return { success: true }
}

export async function deleteCustomer(displayId: string) {
  const customer = await prisma.customer.findUnique({ where: { displayId } })
  if (!customer) return { error: 'Customer not found' }

  await prisma.customer.delete({ where: { displayId } })

  revalidatePath('/customers')
  return { success: true }
}
