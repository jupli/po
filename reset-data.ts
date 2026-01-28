// @ts-nocheck
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting data reset...')

  // Delete transaction data first (child tables first to avoid FK constraints)
  
  console.log('Deleting StockMovements...')
  await prisma.stockMovement.deleteMany({})

  console.log('Deleting GoodsReceiptItems...')
  await prisma.goodsReceiptItem.deleteMany({})

  console.log('Deleting GoodsReceipts...')
  await prisma.goodsReceipt.deleteMany({})

  console.log('Deleting PurchaseOrderItems...')
  await prisma.purchaseOrderItem.deleteMany({})

  console.log('Deleting PurchaseOrders...')
  await prisma.purchaseOrder.deleteMany({})

  // Reset Product Stock to 0
  console.log('Resetting Product Stock...')
  await prisma.product.updateMany({
    data: {
      quantity: 0
    }
  })

  // Delete Recipe data
  // console.log('Deleting RecipeItems...')
  // await prisma.recipeItem.deleteMany({})

  // console.log('Deleting Recipes...')
  // await prisma.recipe.deleteMany({})

  // Optional: Delete Master Data
  // console.log('Deleting Products...')
  // await prisma.product.deleteMany({})
  
  // console.log('Deleting Suppliers...')
  // await prisma.supplier.deleteMany({})

  console.log('Data reset complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
