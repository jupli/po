'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { extractAndSaveRecipes } from '@/app/actions/recipe'

export interface Item {
  id: string
  category: string
  name: string
  unit: string
  quantity: number
  notes: string
  price: number
}

export interface Request {
  id: string
  requestNumber: string
  date: string
  pdfUrl: string
  items: Item[]
  status: 'request' | 'purchase' | 'submission'
  isRevision?: boolean
  managerSignature?: string
  purchasingSignature?: string
}

interface PurchasingContextType {
  requests: Request[]
  updateRequestStatus: (id: string, status: 'request' | 'purchase' | 'submission') => void
  rejectRequest: (id: string) => void
  updateRequestDate: (id: string, date: string) => void
  updateItemPrice: (requestId: string, itemId: string, price: number) => void
  updateRequestSignature: (id: string, role: 'manager' | 'purchasing', signature: string) => void
}

const PurchasingContext = createContext<PurchasingContextType | undefined>(undefined)

const initialItems1: Item[] = [
  // A. Nasi Putih (200 porsi)
  { id: 'a1', category: 'A. Nasi Putih (200 porsi)', name: 'Beras', unit: 'kg', quantity: 30, notes: '±150 gram/porsi matang', price: 0 },
  { id: 'a2', category: 'A. Nasi Putih (200 porsi)', name: 'Air', unit: 'liter', quantity: 45, notes: 'Untuk memasak', price: 0 },
  { id: 'a3', category: 'A. Nasi Putih (200 porsi)', name: 'Garam', unit: 'gram', quantity: 300, notes: '±1,5 gram/porsi', price: 0 },

  // B. Sayur Bayam (200 porsi)
  { id: 'b1', category: 'B. Sayur Bayam (200 porsi)', name: 'Bayam segar', unit: 'ikat', quantity: 40, notes: '±5 porsi/ikat', price: 0 },
  { id: 'b2', category: 'B. Sayur Bayam (200 porsi)', name: 'Jagung manis', unit: 'kg', quantity: 6, notes: 'Dipipil', price: 0 },
  { id: 'b3', category: 'B. Sayur Bayam (200 porsi)', name: 'Wortel', unit: 'kg', quantity: 5, notes: 'Iris tipis', price: 0 },
  { id: 'b4', category: 'B. Sayur Bayam (200 porsi)', name: 'Bawang merah', unit: 'kg', quantity: 1.5, notes: 'Iris', price: 0 },
  { id: 'b5', category: 'B. Sayur Bayam (200 porsi)', name: 'Bawang putih', unit: 'kg', quantity: 1, notes: 'Iris', price: 0 },
  { id: 'b6', category: 'B. Sayur Bayam (200 porsi)', name: 'Garam', unit: 'gram', quantity: 400, notes: 'Penyesuaian rasa', price: 0 },
  { id: 'b7', category: 'B. Sayur Bayam (200 porsi)', name: 'Gula pasir', unit: 'gram', quantity: 300, notes: 'Penyeimbang rasa', price: 0 },
  { id: 'b8', category: 'B. Sayur Bayam (200 porsi)', name: 'Kaldu bubuk', unit: 'gram', quantity: 300, notes: 'Opsional', price: 0 },
  { id: 'b9', category: 'B. Sayur Bayam (200 porsi)', name: 'Air', unit: 'liter', quantity: 40, notes: 'Untuk kuah', price: 0 },

  // C. Ayam Tepung (200 porsi)
  { id: 'c1', category: 'C. Ayam Tepung (200 porsi)', name: 'Ayam potong', unit: 'kg', quantity: 40, notes: '±200 gram/porsi mentah', price: 0 },
  { id: 'c2', category: 'C. Ayam Tepung (200 porsi)', name: 'Tepung terigu', unit: 'kg', quantity: 15, notes: 'Adonan kering', price: 0 },
  { id: 'c3', category: 'C. Ayam Tepung (200 porsi)', name: 'Tepung maizena', unit: 'kg', quantity: 5, notes: 'Campuran', price: 0 },
  { id: 'c4', category: 'C. Ayam Tepung (200 porsi)', name: 'Bawang putih', unit: 'kg', quantity: 2, notes: 'Halus', price: 0 },
  { id: 'c5', category: 'C. Ayam Tepung (200 porsi)', name: 'Garam', unit: 'gram', quantity: 600, notes: 'Marinasi', price: 0 },
  { id: 'c6', category: 'C. Ayam Tepung (200 porsi)', name: 'Merica bubuk', unit: 'gram', quantity: 300, notes: 'Marinasi', price: 0 },
  { id: 'c7', category: 'C. Ayam Tepung (200 porsi)', name: 'Ketumbar bubuk', unit: 'gram', quantity: 300, notes: 'Marinasi', price: 0 },
  { id: 'c8', category: 'C. Ayam Tepung (200 porsi)', name: 'Kaldu bubuk', unit: 'gram', quantity: 500, notes: 'Marinasi', price: 0 },
  { id: 'c9', category: 'C. Ayam Tepung (200 porsi)', name: 'Air', unit: 'liter', quantity: 15, notes: 'Adonan basah', price: 0 },
  { id: 'c10', category: 'C. Ayam Tepung (200 porsi)', name: 'Minyak goreng', unit: 'liter', quantity: 25, notes: 'Menggoreng', price: 0 },

  // D. Susu Kotak (200 porsi)
  { id: 'd1', category: 'D. Susu Kotak (200 porsi)', name: 'Susu UHT kotak', unit: 'pcs', quantity: 200, notes: '±125–200 ml/kotak', price: 0 },

  // E. Buah Pisang (200 porsi)
  { id: 'e1', category: 'E. Buah Pisang (200 porsi)', name: 'Pisang (ambon/kepok)', unit: 'sisir', quantity: 25, notes: '±8 buah/sisir', price: 0 },
]

const initialRequests: Request[] = [
  {
    id: 'req1',
    requestNumber: 'REQ-001',
    date: '2026-01-26',
    pdfUrl: '/Nori.pdf',
    items: initialItems1,
    status: 'request'
  },
  {
    id: 'req2',
    requestNumber: 'REQ-002',
    date: '2026-01-26',
    pdfUrl: '/Nori.pdf',
    items: initialItems1.map(item => ({ ...item, id: item.id + '_2', quantity: Math.round(item.quantity * 0.5) })),
    status: 'request'
  }
]

export function PurchasingProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<Request[]>(initialRequests)

  // Auto-extract recipes removed to prevent duplication on mount/refresh
  // Triggered explicitly via actions instead
  /*
  useEffect(() => {
    requests.forEach(req => {
      if (req.status === 'purchase') {
        extractAndSaveRecipes(req.items, req.date, req.id)
      }
    })
  }, [])
  */

  const updateRequestStatus = (id: string, status: 'request' | 'purchase' | 'submission') => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status } : req
    ))

    // Removed automatic extraction side-effect here to prevent double-calling.
    // Extraction is now handled explicitly in the component before calling this.
    /*
    if (status === 'purchase') {
      const req = requests.find(r => r.id === id)
      if (req) {
        extractAndSaveRecipes(req.items, req.date, req.id)
      }
    }
    */
  }

  const rejectRequest = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'purchase', isRevision: true } : req
    ))
  }

  const updateRequestDate = (id: string, date: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, date } : req
    ))
  }

  const updateItemPrice = (requestId: string, itemId: string, price: number) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req
      return {
        ...req,
        items: req.items.map(item => 
          item.id === itemId ? { ...item, price } : item
        )
      }
    }))
  }

  const updateRequestSignature = (id: string, role: 'manager' | 'purchasing', signature: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== id) return req
      return {
        ...req,
        [role === 'manager' ? 'managerSignature' : 'purchasingSignature']: signature
      }
    }))
  }

  return (
    <PurchasingContext.Provider value={{ requests, updateRequestStatus, rejectRequest, updateRequestDate, updateItemPrice, updateRequestSignature }}>
      {children}
    </PurchasingContext.Provider>
  )
}

export function usePurchasing() {
  const context = useContext(PurchasingContext)
  if (context === undefined) {
    throw new Error('usePurchasing must be used within a PurchasingProvider')
  }
  return context
}
