import { getPurchaseOrdersByStatus, getReceivedPurchaseOrders } from '@/app/actions/po'
import Link from 'next/link'
import IncomingArchive from '@/components/IncomingArchive'

export default async function IncomingPage() {
  // @ts-ignore
  const pendingArrivals = await getPurchaseOrdersByStatus('KIRIM')
  // @ts-ignore
  const receivedHistory = await getReceivedPurchaseOrders()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bahan Masuk (Incoming)</h1>
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Menunggu Pengiriman Tiba</h2>
          <p className="text-sm text-gray-500">Daftar Purchase Order yang sudah dikirim oleh Supplier.</p>
        </div>

        {pendingArrivals.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Tidak ada pengiriman yang sedang berjalan.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. PO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal PO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingArrivals.map((po: any) => (
                <tr key={po.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {po.poNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {po.supplier.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(po.date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {po.items.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      href={`/inventory/incoming/${po.id}`}
                      className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm"
                    >
                      Terima Barang
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <IncomingArchive receivedHistory={receivedHistory} />
    </div>
  )
}
