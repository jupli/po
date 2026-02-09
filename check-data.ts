
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const items = await prisma.deliveryQueue.findMany({
    orderBy: { cookDate: 'desc' }
  })
  
  console.log('Total items in DeliveryQueue:', items.length)
  console.table(items.map(i => ({
    id: i.id,
    menu: i.menuName,
    qty: i.quantity,
    status: i.status,
    cookDate: i.cookDate.toLocaleString()
  })))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
