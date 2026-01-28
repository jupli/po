'use client'

import { useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { usePurchasing } from '@/context/PurchasingContext'
import { extractAndSaveRecipes } from '@/app/actions/recipe'

export default function MaterialRequestPage() {
  const router = useRouter()
  const { requests, updateRequestStatus, updateRequestDate } = usePurchasing()
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)
  const [visiblePdfId, setVisiblePdfId] = useState<string | null>(null)

  // Filter for requests with status 'request'
  const activeRequests = requests.filter(req => req.status === 'request')

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

  const handleSubmitToPurchase = async (requestId: string) => {
    // 1. Find the request object
    const request = requests.find(r => r.id === requestId)
    if (request) {
        // 2. Extract recipes automatically
        await extractAndSaveRecipes(request.items, request.date, request.id)
    }

    // 3. Proceed with existing logic
    updateRequestStatus(requestId, 'purchase')
    router.push('/purchasing/purchase')
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Permintaan Bahan</h1>
      
      <div className="space-y-6">
        {activeRequests.length === 0 ? (
           <div className="text-center py-12 bg-white rounded-lg shadow text-gray-500">
             Tidak ada permintaan bahan yang aktif.
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
                      <h2 className="text-xl font-bold text-gray-800">Form Permintaan</h2>
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
                                    <td colSpan={5} className="px-6 py-2 text-sm font-bold text-gray-900">
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
                                </tr>
                              </Fragment>
                            )
                          })
                        })()}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex justify-end">
                     <button
                       onClick={() => handleSubmitToPurchase(request.id)}
                       className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                     >
                       <span>Kirim Ke Pembelian</span>
                       <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                       </svg>
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
