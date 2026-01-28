'use client'

import { useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { usePurchasing, Item } from '@/context/PurchasingContext'

export default function MaterialPurchasePage() {
  const router = useRouter()
  const { requests, updateRequestDate, updateItemPrice, updateRequestStatus } = usePurchasing()
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)
  const [visiblePdfId, setVisiblePdfId] = useState<string | null>(null)

  // Filter for requests with status 'purchase'
  const activeRequests = requests.filter(req => req.status === 'purchase')

  const handlePriceChange = (requestId: string, itemId: string, value: string) => {
    const newPrice = value === '' ? 0 : parseFloat(value)
    updateItemPrice(requestId, itemId, newPrice)
  }

  const toggleExpand = (requestId: string) => {
    if (expandedRequestId === requestId) {
      setExpandedRequestId(null)
      setVisiblePdfId(null)
    } else {
      setExpandedRequestId(requestId)
      setVisiblePdfId(null) // Reset PDF when switching requests
    }
  }

  const togglePdf = (requestId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (visiblePdfId === requestId) {
      setVisiblePdfId(null)
    } else {
      setVisiblePdfId(requestId)
      // If we open PDF, ensure the request row is also expanded
      if (expandedRequestId !== requestId) {
        setExpandedRequestId(requestId)
      }
    }
  }

  const calculateTotal = (items: Item[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  }

  const handleSubmit = (requestId: string) => {
    const request = requests.find(req => req.id === requestId)
    if (!request) return

    const hasInvalidPrice = request.items.some(item => !item.price || item.price <= 0)
    
    if (hasInvalidPrice) {
      alert('Mohon isi semua harga item sebelum mengajukan pembelian.')
      return
    }

    if (confirm('Apakah Anda yakin ingin mengajukan pembelian ini? Data akan dipindahkan ke menu Pengajuan Pembelian.')) {
      updateRequestStatus(requestId, 'submission')
      router.push('/purchasing/submission')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Pembelian Bahan</h1>
      
      <div className="space-y-6">
        {activeRequests.length === 0 ? (
           <div className="text-center py-12 bg-white rounded-lg shadow text-gray-500">
             Belum ada permintaan pembelian yang masuk.
           </div>
        ) : (
          activeRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Header Section - Clickable to toggle expand */}
              <div 
                className="p-6 border-b cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(request.id)}
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-bold text-gray-800">Permintaan Bahan</h2>
                        {request.isRevision && (
                          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                            Revisi Harga
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-blue-600">No. {request.requestNumber}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg 
                          className={`w-6 h-6 transform transition-transform ${expandedRequestId === request.id ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" onClick={e => e.stopPropagation()}>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Tanggal Permintaan</label>
                      <input
                        type="date"
                        value={request.date}
                        onChange={(e) => updateRequestDate(request.id, e.target.value)}
                        className="border rounded-md px-3 py-2 w-fit bg-white text-gray-900 font-medium min-w-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                      
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Dokumen Pendukung</label>
                      <button
                        onClick={(e) => togglePdf(request.id, e)}
                        className={`flex items-center space-x-2 p-2 border rounded transition-colors w-fit ${
                          visiblePdfId === request.id 
                            ? 'bg-blue-50 border-blue-300 text-blue-800' 
                            : 'border-blue-200 text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Nori.pdf</span>
                      </button>
                    </div>
                  </div>

                  {/* PDF Viewer */}
                  {visiblePdfId === request.id && (
                    <div className="mt-4 border rounded-lg overflow-hidden h-[600px] bg-gray-100 animate-fade-in" onClick={e => e.stopPropagation()}>
                      <iframe
                        src={request.pdfUrl}
                        className="w-full h-full"
                        title="PDF Viewer"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Expanded Table Section */}
              {expandedRequestId === request.id && (
                <div className="bg-white p-6 border-t animate-fade-in">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bahan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satuan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Harga (Rp)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(() => {
                          let currentCategory = ''
                          let categoryIndex = 0
                          
                          return request.items.map((item) => {
                            const isNewCategory = item.category !== currentCategory
                            if (isNewCategory) {
                              currentCategory = item.category
                              categoryIndex = 0
                            }
                            categoryIndex++

                            return (
                              <Fragment key={item.id}>
                                {isNewCategory && (
                                  <tr className="bg-gray-100">
                                    <td colSpan={7} className="px-6 py-2 text-sm font-bold text-gray-900">
                                      {item.category}
                                    </td>
                                  </tr>
                                )}
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{categoryIndex}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.notes}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                      <span className="text-gray-500 mr-1">Rp</span>
                                      <input
                                        type="number"
                                        min="0"
                                        className="bg-gray-100 border-none focus:ring-0 focus:outline-none px-2 py-1 rounded text-gray-900 placeholder-gray-400"
                                        style={{ width: `${Math.max((item.price || 0).toString().length, 6) + 3}ch` }}
                                        placeholder="0"
                                        value={item.price || ''}
                                        onChange={(e) => handlePriceChange(request.id, item.id, e.target.value)}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.quantity * item.price)}
                                  </td>
                                </tr>
                              </Fragment>
                            )
                          })
                        })()}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-right text-sm font-bold text-gray-900">Total Pembelian:</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(calculateTotal(request.items))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="mt-6 flex justify-end">
                     <button 
                       onClick={() => handleSubmit(request.id)}
                       className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                     >
                       Ajukan Pembelian
                     </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
