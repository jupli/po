import { getPurchaseOrders } from '../actions/po'
import Link from 'next/link'
import POList from './POList'

export const dynamic = 'force-dynamic'

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await getPurchaseOrders()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Purchase Orders</h1>
      </div>

      <POList purchaseOrders={purchaseOrders} />
    </div>
  )
}
