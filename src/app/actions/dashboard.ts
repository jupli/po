'use server'

import { prisma } from '@/lib/prisma'

export async function getDashboardStats() {
  const totalProducts = await prisma.product.count()
  const lowStockProducts = await prisma.product.count({
    where: { quantity: { lt: 10 } }
  })
  const totalSuppliers = await prisma.supplier.count()
  const pendingPOs = await prisma.purchaseOrder.count({
    where: { status: 'PENDING' }
  })
  
  const recentPOs = await prisma.purchaseOrder.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { supplier: true }
  })

  return {
    totalProducts,
    lowStockProducts,
    totalSuppliers,
    pendingPOs,
    recentPOs
  }
}
