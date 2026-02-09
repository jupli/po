
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Define cutoff date (e.g., Feb 1st, 2026)
  const cutoffDate = new Date('2026-02-01')

  console.log(`Deleting DeliveryQueue items older than ${cutoffDate.toISOString()}...`)

  const result = await prisma.deliveryQueue.deleteMany({
    where: {
      cookDate: {
        lt: cutoffDate
      }
    }
  })

  console.log(`Deleted ${result.count} old items.`)

  // Verify remaining items
  const remaining = await prisma.deliveryQueue.findMany({
    orderBy: { cookDate: 'desc' }
  })

  console.log('Remaining items in DeliveryQueue:')
  console.table(remaining.map(i => ({
    menu: i.menuName,
    qty: i.quantity,
    date: i.cookDate.toLocaleString()
  })))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
