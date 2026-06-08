import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ── Deterministic random for reproducible seed data ──────────────────────────
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const today = new Date()
const fmt = (d: Date): string => d.toISOString().split('T')[0]
const daysAgo = (n: number): string => {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return fmt(d)
}

async function main() {
  console.log('🌱 Seeding DairyFlow database...')

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminPw  = await bcrypt.hash('admin123', 10)
  const staffPw  = await bcrypt.hash('staff123', 10)
  const adminPin = await bcrypt.hash('1234', 10)  // demo PIN
  const staffPin = await bcrypt.hash('5678', 10)  // demo PIN

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dairy.com' },
    update: { pin: adminPin },
    create: {
      email: 'admin@dairy.com',
      password: adminPw,
      pin: adminPin,
      name: 'Admin User',
      role: 'admin',
      avatar: 'AU',
    },
  })

  const staff = await prisma.user.upsert({
    where: { email: 'staff@dairy.com' },
    update: { pin: staffPin },
    create: {
      email: 'staff@dairy.com',
      password: staffPw,
      pin: staffPin,
      name: 'Staff Member',
      role: 'staff',
      avatar: 'SM',
    },
  })

  console.log('  ✅ Users created (with PINs)')

  // ── Farmers ────────────────────────────────────────────────────────────────
  const farmerData = [
    { displayId: 'F001', name: 'Arjun Singh',  village: 'Sundarpur', phone: '9876543210', cattle: 6,  joinDate: '2023-01-15' },
    { displayId: 'F002', name: 'Deepak Kumar', village: 'Ramnagar',  phone: '9812345678', cattle: 4,  joinDate: '2023-03-22' },
    { displayId: 'F003', name: 'Lakshmi Devi', village: 'Khera',     phone: '9988776655', cattle: 5,  joinDate: '2023-11-10' },
    { displayId: 'F004', name: 'Sanjay Yadav', village: 'Badlapur',  phone: '9834567890', cattle: 8,  joinDate: '2023-06-05' },
    { displayId: 'F005', name: 'Manoj Pathak', village: 'Rampur',    phone: '9765432109', cattle: 3,  joinDate: '2024-01-20' },
    { displayId: 'F006', name: 'Anita Sharma', village: 'Sitapur',   phone: '9856789012', cattle: 7,  joinDate: '2023-09-12' },
    { displayId: 'F007', name: 'Vikram Patel', village: 'Surajpur',  phone: '9823456789', cattle: 5,  joinDate: '2024-02-18' },
    { displayId: 'F008', name: 'Renu Kumari',  village: 'Barsana',   phone: '9745678901', cattle: 10, joinDate: '2023-07-30' },
    { displayId: 'F009', name: 'Om Prakash',   village: 'Sundarpur', phone: '9654321098', cattle: 4,  joinDate: '2024-03-01' },
    { displayId: 'F010', name: 'Suman Lata',   village: 'Ramnagar',  phone: '9543210987', cattle: 6,  joinDate: '2024-04-12' },
  ]

  const farmers = []
  for (const f of farmerData) {
    const farmer = await prisma.farmer.upsert({
      where: { displayId: f.displayId },
      update: {},
      create: { ...f, status: 'active', balance: 0 },
    })
    farmers.push(farmer)
  }
  console.log('  ✅ 10 Farmers created')

  // ── Collections (30 days × 10 farmers) ──────────────────────────────────────
  let colCounter = 1
  const collectionRecords = []

  for (let d = 0; d < 30; d++) {
    const dateStr = daysAgo(d)
    for (let fIdx = 0; fIdx < farmers.length; fIdx++) {
      const farmer = farmers[fIdx]
      const seedBase = d * 100 + fIdx

      // Morning shift
      const mSeed = seedBase + 1
      const morningQty = 5 + seededRandom(mSeed) * 15
      const morningFat = 3.5 + seededRandom(mSeed + 0.5) * 2
      const morningRate = 32 + (morningFat - 3) * 5
      const morningAmount = morningQty * morningRate

      collectionRecords.push({
        displayId: `MC${String(colCounter++).padStart(4, '0')}`,
        farmerId: farmer.id,
        farmerName: farmer.name,
        date: dateStr,
        shift: 'morning',
        qty: Math.round(morningQty * 100) / 100,
        fat: Math.round(morningFat * 100) / 100,
        water: 0,
        rate: Math.round(morningRate * 100) / 100,
        amount: Math.round(morningAmount * 100) / 100,
        status: 'accepted',
      })

      // Evening shift (90% chance)
      if (seededRandom(seedBase + 2) > 0.1) {
        const eSeed = seedBase + 3
        const eveningQty = 4 + seededRandom(eSeed) * 12
        const eveningFat = 3.6 + seededRandom(eSeed + 0.5) * 2.2
        const eveningRate = 32 + (eveningFat - 3) * 5
        const eveningAmount = eveningQty * eveningRate

        collectionRecords.push({
          displayId: `MC${String(colCounter++).padStart(4, '0')}`,
          farmerId: farmer.id,
          farmerName: farmer.name,
          date: dateStr,
          shift: 'evening',
          qty: Math.round(eveningQty * 100) / 100,
          fat: Math.round(eveningFat * 100) / 100,
          water: 0,
          rate: Math.round(eveningRate * 100) / 100,
          amount: Math.round(eveningAmount * 100) / 100,
          status: 'accepted',
        })
      }
    }
  }

  // Batch insert collections
  await prisma.collection.createMany({ data: collectionRecords })
  console.log(`  ✅ ${collectionRecords.length} Collections created`)

  // Update farmer balances based on collections
  for (const farmer of farmers) {
    const totalAmount = collectionRecords
      .filter(c => c.farmerId === farmer.id)
      .reduce((sum, c) => sum + c.amount, 0)
    await prisma.farmer.update({
      where: { id: farmer.id },
      data: { balance: Math.round(totalAmount * 100) / 100 },
    })
  }
  console.log('  ✅ Farmer balances updated')

  // ── Customers ──────────────────────────────────────────────────────────────
  await prisma.customer.upsert({
    where: { displayId: 'C001' },
    update: {},
    create: {
      displayId: 'C001',
      name: 'Anand Stores',
      type: 'retail',
      phone: '9911223344',
      address: 'MG Road, City',
      dailyQty: 20,
      status: 'active',
      balance: 0,
    },
  })

  await prisma.customer.upsert({
    where: { displayId: 'C002' },
    update: {},
    create: {
      displayId: 'C002',
      name: 'City Hotel',
      type: 'bulk',
      phone: '9922334455',
      address: 'Hotel Lane, City',
      dailyQty: 80,
      status: 'active',
      balance: 0,
    },
  })
  console.log('  ✅ 2 Customers created')

  // ── Tanks ──────────────────────────────────────────────────────────────────
  await prisma.tank.upsert({
    where: { displayId: 'T001' },
    update: {},
    create: {
      displayId: 'T001',
      name: 'Main Tank',
      capacity: 10000,
      current: 4500,
      temp: 4.0,
      status: 'operational',
      lastCleaned: daysAgo(1),
    },
  })

  await prisma.tank.upsert({
    where: { displayId: 'T002' },
    update: {},
    create: {
      displayId: 'T002',
      name: 'Buffer A',
      capacity: 2000,
      current: 800,
      temp: 4.2,
      status: 'operational',
      lastCleaned: daysAgo(3),
    },
  })
  console.log('  ✅ 2 Tanks created')

  // ── Notifications ──────────────────────────────────────────────────────────
  const notifData = [
    { type: 'payment',     msg: 'Payment pending for Sunita Devi – ₹5,600', time: '2h ago',  read: false },
    { type: 'collection',  msg: 'Evening collection not yet entered',        time: '4h ago',  read: false },
    { type: 'maintenance', msg: 'Chiller 1 due for maintenance',             time: '1d ago',  read: true  },
    { type: 'payment',     msg: 'Payment pending for Kavita Sharma',         time: '1d ago',  read: true  },
  ]

  for (const n of notifData) {
    await prisma.notification.create({
      data: { ...n, userId: admin.id },
    })
  }
  // Duplicate for staff user
  for (const n of notifData) {
    await prisma.notification.create({
      data: { ...n, userId: staff.id },
    })
  }
  console.log('  ✅ Notifications created')

  console.log('\n🎉 Seed complete!')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
