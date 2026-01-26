'use client'

import { PurchasingProvider } from '@/context/PurchasingContext'

export default function PurchasingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PurchasingProvider>
      {children}
    </PurchasingProvider>
  )
}
