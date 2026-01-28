'use client'

import { useState } from 'react'

interface DistributionArchiveProps {
  historyItems: any[]
}

export default function DistributionArchive({ historyItems }: DistributionArchiveProps) {
  const [expandedDates, setExpandedDates] = useState<string[]>([])

  // Group by Date (Shipped Date or QC Date)
  const groupedData = historyItems.reduce((acc: any, item: any) => {
    // Prioritize shippedAt, fallback to qcDate
    const dateObj = item.shippedAt ? new Date(item.shippedAt) : new Date(item.qcDate)
    
    const date = dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {})

  const toggleDate = (date: string) => {
    setExpandedDates(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">Arsip Distribusi & QC</h2>
        <p className="text-sm text-gray-500">Riwayat pengiriman dan hasil QC (Dikelompokkan per Tanggal).</p>
      </div>

      {Object.keys(groupedData).length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          Belum ada riwayat distribusi.
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {Object.entries(groupedData).map(([date, items]: [string, any]) => (
            <div key={date} className="bg-white">
              {/* Folder Header */}
              <button 
                onClick={() => toggleDate(date)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <svg 
                    className={`w-6 h-6 text-yellow-500 transition-transform ${expandedDates.includes(date) ? 'rotate-90' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className="text-lg font-medium text-gray-900">{date}</span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {items.length} Item
                  </span>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedDates.includes(date) ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded Content */}
              {expandedDates.includes(date) && (
                <div className="border-t border-gray-100 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail QC</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item: any) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.menuName}
                            <div className="text-xs text-gray-500">{item.quantity} porsi</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === 'SHIPPED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <span className="font-bold">Kirim:</span> {item.shippedAt ? new Date(item.shippedAt).toLocaleTimeString('id-ID') : '-'}
                            </div>
                            <div className="text-xs mt-1">
                              <span className="font-bold">QC:</span> {item.qcDate ? new Date(item.qcDate).toLocaleTimeString('id-ID') : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="flex flex-col">
                              <span className="font-medium">Oleh: {item.qcBy}</span>
                              <span className="text-xs italic text-gray-600">"{item.qcNotes}"</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {item.photoUrl ? (
                               <a 
                                 href={item.photoUrl} 
                                 target="_blank" 
                                 className="inline-block"
                               >
                                 <img 
                                   src={item.photoUrl} 
                                   alt="Foto Paket" 
                                   className="h-16 w-16 object-cover rounded border border-gray-200 hover:opacity-75 transition-opacity"
                                 />
                               </a>
                             ) : (
                               <span className="text-gray-400 italic">No Photo</span>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
