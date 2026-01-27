import { getPurchaseOrderById } from '@/app/actions/po'
import ReceiveForm from '@/components/ReceiveForm'
import { notFound } from 'next/navigation'

export default async function ReceivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const po = await getPurchaseOrderById(id)

  if (!po) return notFound()

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Form Penerimaan Barang</h1>
        <div className="text-sm text-gray-500">
          Ref PO: <span className="font-mono font-bold text-gray-900">{po.poNumber}</span>
        </div>
      </div>
      
      <ReceiveForm po={po} />
    </div>
  )
}
