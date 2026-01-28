import { getPurchaseOrderById } from '@/app/actions/po'
import EditPOForm from '@/components/EditPOForm'
import { notFound } from 'next/navigation'

export default async function EditPOPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const po = await getPurchaseOrderById(id)

  if (!po) return notFound()

  // Only allow editing PENDING POs
  if (po.status !== 'PENDING') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
        <p>Hanya Purchase Order dengan status PENDING yang dapat diedit.</p>
        <p className="mt-4 text-sm text-gray-500">Status PO ini: {po.status}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Purchase Order</h1>
      <EditPOForm po={po} />
    </div>
  )
}
