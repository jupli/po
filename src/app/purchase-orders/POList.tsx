'use client'

import { useState } from 'react'
import { POStatus, PurchaseOrder as PrismaPO } from '@prisma/client'
import POStatusBadge from '../../components/POStatusBadge'
import POActions from '../../components/POActions'

// Define a type for the PO that matches what comes from the server action/Prisma
type PurchaseOrder = PrismaPO & {
  supplier: {
    name: string
  }
  items: any[]
}

export default function POList({ purchaseOrders }: { purchaseOrders: PurchaseOrder[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null)

  // 1. Group POs by Date (YYYY-MM-DD)
  const groupedByDate = purchaseOrders.reduce((acc: Record<string, PurchaseOrder[]>, po: PurchaseOrder) => {
    const dateKey = new Date(po.date).toISOString().split('T')[0]
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(po)
    return acc
  }, {} as Record<string, PurchaseOrder[]>)

  // Sort dates descending
  const dates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a))

  // If a date is selected, get POs for that date
  const datePOs = selectedDate ? groupedByDate[selectedDate] : []

  // 2. Within Date, Group POs by Supplier Name
  const groupedBySupplier = datePOs.reduce((acc: Record<string, PurchaseOrder[]>, po: PurchaseOrder) => {
    const supplierName = po.supplier.name
    if (!acc[supplierName]) {
      acc[supplierName] = []
    }
    acc[supplierName].push(po)
    return acc
  }, {} as Record<string, PurchaseOrder[]>)

  const suppliers = Object.keys(groupedBySupplier).sort()

  // Format date helper
  const formatDateLabel = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // VIEW 3: PO Table (Date & Supplier Selected)
  if (selectedDate && selectedSupplier) {
    const supplierPOs = groupedBySupplier[selectedSupplier] || []
    return (
      <div>
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => setSelectedSupplier(null)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke {formatDateLabel(selectedDate)}
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <span className="text-gray-500 font-normal mr-2">{formatDateLabel(selectedDate)} /</span>
            <span className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                 <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              {selectedSupplier}
            </span>
          </h2>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. PO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Nilai</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dokumen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supplierPOs.map((po: PurchaseOrder) => (
                <tr key={po.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">{po.poNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">{new Date(po.date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 align-top">
                    <ul className="list-disc pl-4 space-y-1">
                      {po.items.map((item: any, idx: number) => (
                        <li key={idx}>
                          <span className="font-medium text-gray-700">{item.product?.name || item.productId}</span>
                          <span className="text-gray-500 text-xs ml-1">({item.quantity} {item.product?.unit || 'unit'})</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">{po.items.length} items</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(po.totalAmount))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                    {/* @ts-ignore */}
                    {po.documentPath ? (
                      <a 
                        // @ts-ignore
                        href={po.documentPath} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-800 flex items-center font-medium"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        PDF
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    <POStatusBadge status={po.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                    <POActions po={po} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // VIEW 2: Supplier Folders (Date Selected)
  if (selectedDate) {
    return (
      <div>
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => setSelectedDate(null)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Daftar Tanggal
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDateLabel(selectedDate)}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplierName) => {
            const count = groupedBySupplier[supplierName].length
            const totalValue = groupedBySupplier[supplierName].reduce((sum: number, po: PurchaseOrder) => sum + Number(po.totalAmount), 0)
            
            return (
              <div 
                key={supplierName}
                onClick={() => setSelectedSupplier(supplierName)}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{supplierName}</h3>
                <p className="text-sm text-gray-500 mb-4">{count} Purchase Order</p>
                <div className="mt-auto w-full border-t pt-4">
                  <p className="text-xs text-gray-500 uppercase">Total Nilai</p>
                  <p className="font-bold text-green-600">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalValue)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // VIEW 1: Date Folders (Initial View)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dates.map((dateStr) => {
        const count = groupedByDate[dateStr].length
        // Calculate total value for this date
        const totalValue = groupedByDate[dateStr].reduce((sum: number, po: PurchaseOrder) => sum + Number(po.totalAmount), 0)
        
        return (
          <div 
            key={dateStr}
            onClick={() => setSelectedDate(dateStr)}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{formatDateLabel(dateStr)}</h3>
            <p className="text-sm text-gray-500 mb-4">{count} Purchase Order</p>
            <div className="mt-auto w-full border-t pt-4">
              <p className="text-xs text-gray-500 uppercase">Total Nilai</p>
              <p className="font-bold text-green-600">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalValue)}
              </p>
            </div>
          </div>
        )
      })}
      
      {dates.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          Belum ada Purchase Order yang dibuat.
        </div>
      )}
    </div>
  )
}
