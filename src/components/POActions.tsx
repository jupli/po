'use client'

import { POStatus, PurchaseOrder } from '@prisma/client'
import { updatePOStatus } from '@/app/actions/po'
import { useState } from 'react'

export default function POActions({ po }: { po: PurchaseOrder }) {
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(status: POStatus | 'KIRIM') {
    if (!confirm(`Are you sure you want to mark this PO as ${status}?`)) return
    
    setLoading(true)
    // @ts-ignore
    await updatePOStatus(po.id, status)
    setLoading(false)
  }

  if (po.status === 'RECEIVED' || po.status === 'REJECTED' || po.status === 'CANCELLED') {
    return null
  }

  return (
    <div className="flex space-x-2">
      {po.status === 'PENDING' && (
        <>
          <button 
            onClick={() => handleStatusChange('KIRIM')}
            disabled={loading}
            className="text-blue-600 hover:text-blue-900 text-xs font-bold"
          >
            Approve
          </button>
          <button 
            onClick={() => handleStatusChange('REJECTED')}
            disabled={loading}
            className="text-red-600 hover:text-red-900 text-xs font-bold"
          >
            Reject
          </button>
        </>
      )}
      
      {(po.status === 'APPROVED' || po.status === 'KIRIM') && (
        <button 
          onClick={() => handleStatusChange('RECEIVED')}
          disabled={loading}
          className="text-green-600 hover:text-green-900 text-xs font-bold"
        >
          Receive
        </button>
      )}
      
      {(po.status === 'PENDING' || po.status === 'APPROVED' || po.status === 'KIRIM') && (
        <button 
          onClick={() => handleStatusChange('CANCELLED')}
          disabled={loading}
          className="text-gray-600 hover:text-gray-900 text-xs"
        >
          Cancel
        </button>
      )}
    </div>
  )
}
