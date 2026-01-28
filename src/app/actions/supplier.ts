'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSuppliers() {
  try {
    return await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Database Error:', error)
    return []
  }
}

export async function createSupplier(formData: FormData) {
  const name = formData.get('name') as string
  const contact = formData.get('contact') as string
  const address = formData.get('address') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string

  try {
    await prisma.supplier.create({
      data: {
        name,
        contact,
        address,
        email,
        phone
      }
    })
    revalidatePath('/suppliers')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create supplier' }
  }
}

export async function updateSupplier(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const contact = formData.get('contact') as string
  const address = formData.get('address') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string

  try {
    await prisma.supplier.update({
      where: { id },
      data: {
        name,
        contact,
        address,
        email,
        phone
      }
    })
    revalidatePath('/suppliers')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update supplier' }
  }
}
