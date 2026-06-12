'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { paymentSchema } from '@/lib/schemas'
import { getSession } from '@/lib/session'

interface AddPaymentInput {
  farmerId: string       // display ID like "F001"
  farmerName: string
  amount: number
  method: 'cash' | 'bank' | 'upi' | 'cheque'
  status: 'paid' | 'pending'
  note: string
  date: string
}

export async function addPayment(data: AddPaymentInput) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const parsed = paymentSchema.safeParse({
    farmerId: data.farmerId,
    amount: data.amount,
    method: data.method,
    note: data.note,
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // Find farmer scoped to user
  const farmer = await prisma.farmer.findFirst({
    where: { displayId: data.farmerId, userId: session.userId },
  })
  if (!farmer) return { error: 'Farmer not found' }

  // Generate display ID scoped to user
  const lastPayment = await prisma.payment.findFirst({
    where: { userId: session.userId },
    orderBy: { displayId: 'desc' },
  })
  const lastNum = lastPayment
    ? parseInt(lastPayment.displayId.replace('P', ''), 10)
    : 0
  const displayId = `P${String(lastNum + 1).padStart(3, '0')}`

  await prisma.$transaction(async (tx) => {
    // Create payment
    await tx.payment.create({
      data: {
        displayId,
        farmerId: farmer.id,
        farmerName: data.farmerName || farmer.name,
        amount: data.amount,
        date: data.date,
        method: data.method,
        status: data.status,
        note: data.note || '',
        userId: session.userId,
      },
    })

    // If payment is immediately paid, deduct balance and create receipt
    if (data.status === 'paid') {
      await tx.farmer.update({
        where: { id: farmer.id },
        data: { balance: { decrement: data.amount } },
      })

      // Auto-create receipt
      const lastReceipt = await tx.receipt.findFirst({
        where: { userId: session.userId },
        orderBy: { displayId: 'desc' },
      })
      const lastRNum = lastReceipt
        ? parseInt(lastReceipt.displayId.replace('R', ''), 10)
        : 0
      const receiptDisplayId = `R${String(lastRNum + 1).padStart(3, '0')}`
      const today = new Date().toISOString().split('T')[0]

      // We need to find the payment we just created
      const createdPayment = await tx.payment.findFirst({
        where: { displayId, userId: session.userId },
      })
      if (createdPayment) {
        await tx.receipt.create({
          data: {
            displayId: receiptDisplayId,
            paymentId: createdPayment.id,
            farmerId: farmer.id,
            farmerName: data.farmerName || farmer.name,
            amount: data.amount,
            date: data.date,
            paidDate: today,
            method: data.method,
            note: data.note || '',
            userId: session.userId,
          },
        })
      }
    }
  })

  revalidatePath('/payments')
  revalidatePath('/library')
  revalidatePath('/farmers')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function markPaymentPaid(paymentDisplayId: string) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const payment = await prisma.payment.findFirst({
    where: { displayId: paymentDisplayId, userId: session.userId },
  })
  if (!payment) return { error: 'Payment not found' }
  if (payment.status === 'paid') return { error: 'Payment already marked as paid' }

  const today = new Date().toISOString().split('T')[0]

  await prisma.$transaction(async (tx) => {
    // Mark payment as paid
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'paid' },
    })

    // Deduct farmer balance
    await tx.farmer.update({
      where: { id: payment.farmerId },
      data: { balance: { decrement: payment.amount } },
    })

    // Auto-generate receipt
    const lastReceipt = await tx.receipt.findFirst({
      where: { userId: session.userId },
      orderBy: { displayId: 'desc' },
    })
    const lastRNum = lastReceipt
      ? parseInt(lastReceipt.displayId.replace('R', ''), 10)
      : 0
    const receiptDisplayId = `R${String(lastRNum + 1).padStart(3, '0')}`

    await tx.receipt.create({
      data: {
        displayId: receiptDisplayId,
        paymentId: payment.id,
        farmerId: payment.farmerId,
        farmerName: payment.farmerName,
        amount: payment.amount,
        date: payment.date,
        paidDate: today,
        method: payment.method,
        note: payment.note,
        userId: session.userId,
      },
    })
  })

  revalidatePath('/payments')
  revalidatePath('/library')
  revalidatePath('/farmers')
  revalidatePath('/dashboard')
  return { success: true }
}
