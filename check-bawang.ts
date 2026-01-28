
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Check Product Stock
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: 'Bawang Merah',
        mode: 'insensitive'
      }
    }
  })

  console.log('--- PRODUCT STOCK ---')
  console.log(JSON.stringify(products, null, 2))

  // 2. Check Purchase Orders containing Bawang Merah
  if (products.length > 0) {
    const productIds = products.map(p => p.id)
    
    const poItems = await prisma.purchaseOrderItem.findMany({
      where: {
        productId: {
          in: productIds
        }
      },
      include: {
        purchaseOrder: true
      }
    })

    console.log('\n--- PO ITEMS ---')
    poItems.forEach(item => {
        console.log(`PO: ${item.purchaseOrder.poNumber} | Status: ${item.purchaseOrder.status} | Qty Ordered: ${item.quantity} ${item.unit}`)
    })

    // 3. Check Goods Receipts
    const receiptItems = await prisma.goodsReceiptItem.findMany({
        where: {
            productId: {
                in: productIds
            }
        },
        include: {
            goodsReceipt: true
        }
    })

    console.log('\n--- GOODS RECEIPT ITEMS ---')
    receiptItems.forEach(item => {
        console.log(`DO: ${item.goodsReceipt.doNumber} | Qty Received: ${item.quantity}`)
    })
    
    // 4. Check Stock Movements
    const movements = await prisma.stockMovement.findMany({
        where: {
            productId: {
                in: productIds
            }
        }
    })
    
    console.log('\n--- STOCK MOVEMENTS ---')
    movements.forEach(mov => {
        console.log(`Type: ${mov.type} | Qty: ${mov.quantity} | Ref: ${mov.reference}`)
    })
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
