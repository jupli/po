import { getPurchaseOrders } from '../actions/po'
import Link from 'next/link'
import POList from './POList'

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await getPurchaseOrders()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Purchase Orders</h1>
        <Link href="/purchase-orders/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Manual PO
        </Link>
      </div>

      <POList purchaseOrders={purchaseOrders} />
    </div>
  )
}
