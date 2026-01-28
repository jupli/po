
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('--- Checking Suppliers ---')
  const suppliers = await prisma.supplier.findMany()
  suppliers.forEach((s: any) => console.log(`${s.id}: ${s.name}`))

  console.log('\n--- Checking Products and their Suppliers ---')
  const products = await prisma.product.findMany({
    // @ts-ignore
    include: { supplier: true }
  })
  products.forEach((p: any) => {
    console.log(`Product: ${p.name} | Current Supplier: ${p.supplier?.name || 'None'} | SupplierID: ${p.supplierId}`)
  })

  console.log('\n--- Checking POs and their Items ---')
  const pos = await prisma.purchaseOrder.findMany({
    include: { 
        supplier: true,
        items: { include: { product: true } } 
    }
  })
  
  pos.forEach((po: any) => {
    console.log(`PO: ${po.poNumber} | Supplier: ${po.supplier?.name}`)
    po.items.forEach((item: any) => {
        console.log(`  - Item: ${item.product?.name} (Qty: ${item.quantity})`)
    })
  })
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
