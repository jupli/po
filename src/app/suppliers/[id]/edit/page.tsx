import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditSupplierForm from '../../../../components/EditSupplierForm'

export default async function EditSupplierPage({ params }: { params: { id: string } }) {
  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id }
  })

  if (!supplier) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Supplier: {supplier.name}</h1>
      <EditSupplierForm supplier={supplier} />
    </div>
  )
}
