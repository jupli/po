'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import SignatureCanvas from 'react-signature-canvas'
import { createGoodsReceipt } from '@/app/actions/po'

export default function ReceiveForm({ po }: { po: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    doNumber: '',
    receivedAt: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    receiver: '',
    courier: '',
    condition: 'Baik',
    notes: ''
  })

  const [items, setItems] = useState<{
    poItemId: string
    productId: string
    productName: string
    productCategory: string
    quantity: number | string
    quantityRejected: number | string
    condition: string
  }[]>(po.items.map((item: any) => ({
    poItemId: item.id,
    productId: item.productId,
    productName: item.product.name,
    productCategory: item.product.category || 'Lain-lain',
    quantity: item.quantity, // Default to PO quantity
    quantityRejected: 0,
    condition: 'Baik'
  })))

  const receiverSigRef = useRef<SignatureCanvas>(null)
  const courierSigRef = useRef<SignatureCanvas>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.doNumber || !formData.receiver || !formData.courier) {
      alert('Mohon lengkapi data form (No. DO, Penerima, Kurir)')
      return
    }

    if (receiverSigRef.current?.isEmpty() || courierSigRef.current?.isEmpty()) {
      alert('Mohon lengkapi tanda tangan Penerima dan Kurir')
      return
    }

    if (!confirm('Pastikan data sudah benar. Lanjutkan penerimaan barang?')) return

    setLoading(true)

    try {
      const result = await createGoodsReceipt({
        poId: po.id,
        doNumber: formData.doNumber,
        receivedAt: new Date(formData.receivedAt),
        receiver: formData.receiver,
        receiverSign: receiverSigRef.current?.toDataURL() || '',
        courier: formData.courier,
        courierSign: courierSigRef.current?.toDataURL() || '',
        condition: formData.condition,
        notes: formData.notes,
        items: items.map((item: any) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          quantityRejected: Number(item.quantityRejected),
          condition: item.condition
        }))
      })

      if (result.success) {
        alert('Barang berhasil diterima!')
        router.push('/inventory/incoming')
      } else {
        alert('Gagal menerima barang: ' + result.error)
      }
    } catch (error) {
      console.error(error)
      alert('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const clearReceiverSig = () => receiverSigRef.current?.clear()
  const clearCourierSig = () => courierSigRef.current?.clear()

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nomor PO (Otomatis)</label>
            <input 
              type="text" 
              value={po.poNumber} 
              disabled 
              className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nomor DO (Dari Supplier)</label>
            <input 
              type="text" 
              required
              value={formData.doNumber}
              onChange={e => setFormData({...formData, doNumber: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Masukkan No. DO"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Waktu Penerimaan</label>
            <input 
              type="datetime-local" 
              required
              value={formData.receivedAt}
              onChange={e => setFormData({...formData, receivedAt: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Kondisi Umum Paket</label>
            <input 
              type="text" 
              value={formData.condition}
              onChange={e => setFormData({...formData, condition: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Catatan Tambahan</label>
            <textarea 
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Detail Bahan yang Dikirim</h3>
        
        {/* Helper function to render table */}
        {['Bahan Kering', 'Bahan Basah', 'Lain-lain'].map((category) => {
            const categoryItems = items.filter((i: any) => i.productCategory === category)
            if (categoryItems.length === 0) return null

            return (
                <div key={category} className="mb-8 last:mb-0">
                    <h4 className={`text-md font-bold mb-2 px-2 py-1 inline-block rounded ${
                        category === 'Bahan Kering' ? 'bg-orange-100 text-orange-800' : 
                        category === 'Bahan Basah' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {category}
                    </h4>
                    <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty PO</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Diterima (Bagus)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Rusak (Retur)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kondisi</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {categoryItems.map((item: any) => {
                            // Find original index in full items array to update state correctly
                            const originalIndex = items.findIndex((i: any) => i.poItemId === item.poItemId)
                            
                            return (
                                <tr key={item.poItemId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.productName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{po.items.find((i: any) => i.id === item.poItemId)?.quantity || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <input 
                                    type="number" 
                                    min="0"
                                    step="any"
                                    value={item.quantity}
                                    onChange={(e) => {
                                        const newItems = [...items]
                                        newItems[originalIndex].quantity = e.target.value
                                        setItems(newItems)
                                    }}
                                    className="w-24 border border-gray-300 rounded-md px-2 py-1"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <input 
                                    type="number" 
                                    min="0"
                                    step="any"
                                    value={item.quantityRejected}
                                    onChange={(e) => {
                                        const newItems = [...items]
                                        newItems[originalIndex].quantityRejected = e.target.value
                                        setItems(newItems)
                                    }}
                                    className="w-24 border border-red-300 rounded-md px-2 py-1 bg-red-50"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <input 
                                    type="text" 
                                    value={item.condition}
                                    onChange={(e) => {
                                        const newItems = [...items]
                                        newItems[originalIndex].condition = e.target.value
                                        setItems(newItems)
                                    }}
                                    className="w-full border border-gray-300 rounded-md px-2 py-1"
                                    />
                                </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                    </div>
                </div>
            )
        })}
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Receiver Signature */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pihak Penerima (Gudang)</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nama Penerima</label>
            <input 
              type="text" 
              required
              value={formData.receiver}
              onChange={e => setFormData({...formData, receiver: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Nama Lengkap"
            />
          </div>
          <div className="border border-gray-300 rounded-md bg-gray-50 relative">
            <SignatureCanvas 
              ref={receiverSigRef}
              canvasProps={{
                width: 400, 
                height: 200, 
                className: 'sigCanvas w-full h-48 cursor-crosshair'
              }} 
            />
            <button 
              type="button" 
              onClick={clearReceiverSig}
              className="absolute top-2 right-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
            >
              Clear
            </button>
            <div className="absolute bottom-2 left-2 text-xs text-gray-400 pointer-events-none">Tanda Tangan Disini</div>
          </div>
        </div>

        {/* Courier Signature */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pihak Pengirim (Kurir)</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nama Kurir</label>
            <input 
              type="text" 
              required
              value={formData.courier}
              onChange={e => setFormData({...formData, courier: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Nama Lengkap"
            />
          </div>
          <div className="border border-gray-300 rounded-md bg-gray-50 relative">
            <SignatureCanvas 
              ref={courierSigRef}
              canvasProps={{
                width: 400, 
                height: 200, 
                className: 'sigCanvas w-full h-48 cursor-crosshair'
              }} 
            />
            <button 
              type="button" 
              onClick={clearCourierSig}
              className="absolute top-2 right-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
            >
              Clear
            </button>
            <div className="absolute bottom-2 left-2 text-xs text-gray-400 pointer-events-none">Tanda Tangan Disini</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-bold"
        >
          {loading ? 'Memproses...' : 'Simpan Penerimaan Barang'}
        </button>
      </div>
    </form>
  )
}
