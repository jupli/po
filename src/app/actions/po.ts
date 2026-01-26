'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { POStatus, MovementType } from '@prisma/client'

export async function getPurchaseOrders() {
  try {
    return await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Database Error:', error)
    return []
  }
}

export async function getPurchaseOrderById(id: string) {
  try {
    return await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Database Error:', error)
    return null
  }
}

export async function createPurchaseOrder(data: {
  supplierId: string,
  items: { productId: string, quantity: number, unitPrice: number }[]
}) {
  try {
    // Generate PO Number
    const count = await prisma.purchaseOrder.count()
    const poNumber = `PO-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`

    const totalAmount = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)

    await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId: data.supplierId,
        totalAmount,
        status: 'PENDING',
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        }
      }
    })
    revalidatePath('/purchase-orders')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to create PO' }
  }
}

export async function updatePOStatus(id: string, status: POStatus) {
  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!po) return { success: false, error: 'PO not found' }

    // If status is changed to RECEIVED, update inventory
    if (status === 'RECEIVED' && po.status !== 'RECEIVED') {
      await prisma.$transaction(async (tx) => {
        // Update PO status
        await tx.purchaseOrder.update({
          where: { id },
          data: { status }
        })

        // Update Inventory
        for (const item of po.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              quantity: { increment: item.quantity }
            }
          })

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: MovementType.IN,
              quantity: item.quantity,
              reference: po.poNumber,
              description: `Received from PO ${po.poNumber}`
            }
          })
        }
      })
    } else {
      await prisma.purchaseOrder.update({
        where: { id },
        data: { status }
      })
    }

    revalidatePath('/purchase-orders')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to update PO status' }
  }
}
