'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePurchaseOrderItems } from '@/app/actions/po'

export default function EditPOForm({ po }: { po: any }) {
  const router = useRouter()
  const [items, setItems] = useState(po.items.map((item: any) => ({
    id: item.id,
    productName: item.product?.name,
    unit: item.product?.unit,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total
  })))
  const [loading, setLoading] = useState(false)

  const handleQuantityChange = (idx: number, val: string) => {
    const qty = Number(val)
    const newItems = [...items]
    newItems[idx].quantity = qty
    newItems[idx].total = qty * newItems[idx].unitPrice
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm('Simpan perubahan PO?')) return
    
    setLoading(true)
    const result = await updatePurchaseOrderItems(po.id, items.map((i: any) => ({ id: i.id, quantity: i.quantity })))
    setLoading(false)
    
    if (result.success) {
      router.push('/purchase-orders')
    } else {
      alert('Gagal update PO')
    }
  }

  const grandTotal = items.reduce((sum: number, item: any) => sum + item.total, 0)

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Edit Item PO: {po.poNumber}</h2>
        <p className="text-sm text-gray-500">Silakan koreksi jumlah item jika ada kesalahan.</p>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Satuan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item: any, idx: number) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.unitPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, e.target.value)}
                      className="w-24 border border-gray-300 rounded px-2 py-1"
                    />
                    <span className="text-gray-500">{item.unit}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
             <tr>
               <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-700">Total Nilai:</td>
               <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                 {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(grandTotal)}
               </td>
             </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold"
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  )
}
