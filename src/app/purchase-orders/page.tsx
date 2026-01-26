import { getPurchaseOrders, updatePOStatus } from '../actions/po'
import Link from 'next/link'
import { POStatus } from '@prisma/client'
import POStatusBadge from '../../components/POStatusBadge'
import POActions from '../../components/POActions'

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await getPurchaseOrders()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Purchase Orders</h1>
        <Link href="/purchase-orders/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create PO
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchaseOrders.map((po) => (
              <tr key={po.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{po.poNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.supplier.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(po.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.items.length} items</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(po.totalAmount))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <POStatusBadge status={po.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <POActions po={po} />
                </td>
              </tr>
            ))}
            {purchaseOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No purchase orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
