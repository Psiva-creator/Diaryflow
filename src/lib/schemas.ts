import { z } from 'zod'

// ── Farmer ────────────────────────────────────────────────────────────────────

export const farmerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  village: z.string().min(2, 'Village is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be a 10-digit number'),
  cattle: z.number().int().min(1, 'Must have at least 1 cattle').max(1000, 'Cattle count cannot exceed 1,000'),
})

export type FarmerSchemaType = z.infer<typeof farmerSchema>

// ── Customer ──────────────────────────────────────────────────────────────────

export const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  type: z.enum(['retail', 'bulk', 'subscription']),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be a 10-digit number'),
  address: z.string().optional().default(''),
  dailyQty: z.number().min(1, 'Daily quantity must be at least 1').max(10000, 'Daily quantity cannot exceed 10,000 litres'),
})

export type CustomerSchemaType = z.infer<typeof customerSchema>

// ── Collection ────────────────────────────────────────────────────────────────

export const collectionSchema = z.object({
  farmerId: z.string().min(1, 'Select a farmer'),
  shift: z.enum(['morning', 'evening']),
  qty: z.number().positive('Quantity must be greater than 0'),
  fat: z.number().min(0).max(10, 'Fat% must be between 0 and 10'),
  water: z.number().min(0).max(100, 'Water% must be between 0 and 100'),
  snf: z.number().min(0).max(15, 'SNF% must be between 0 and 15').optional(),
  date: z.string().min(1, 'Date is required'),
})

export type CollectionSchemaType = z.infer<typeof collectionSchema>

// ── Payment ───────────────────────────────────────────────────────────────────

export const paymentSchema = z.object({
  farmerId: z.string().min(1, 'Select a farmer'),
  amount: z.number().positive('Amount must be greater than 0'),
  method: z.enum(['cash', 'bank', 'upi', 'cheque']),
  note: z.string().optional().default(''),
})

export type PaymentSchemaType = z.infer<typeof paymentSchema>

// ── Login ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginSchemaType = z.infer<typeof loginSchema>
