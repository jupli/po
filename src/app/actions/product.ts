'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
  try {
    return await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Database Error:', error)
    return []
  }
}

export async function getProductsByCategory(category: string) {
  try {
    return await prisma.product.findMany({
      where: { category },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Database Error:', error)
    return []
  }
}

export async function getCategories() {
  try {
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category']
    })
    return products.map(p => p.category).filter(Boolean)
  } catch (error) {
    console.error('Database Error:', error)
    return []
  }
}

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const sku = formData.get('sku') as string
  const description = formData.get('description') as string
  const quantity = parseInt(formData.get('quantity') as string) || 0
  const price = parseFloat(formData.get('price') as string) || 0
  const unit = formData.get('unit') as string

  try {
    await prisma.product.create({
      data: {
        name,
        sku,
        description,
        quantity,
        price,
        unit
      }
    })
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create product' }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const sku = formData.get('sku') as string
  const description = formData.get('description') as string
  const quantity = parseInt(formData.get('quantity') as string) || 0
  const price = parseFloat(formData.get('price') as string) || 0
  const unit = formData.get('unit') as string

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        description,
        quantity,
        price,
        unit
      }
    })
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update product' }
  }
}
