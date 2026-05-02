'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!currentUser) {
      router.replace('/login')
    } else if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
      router.replace('/admin/dashboard')
    }
  }, [currentUser, isLoading, router])

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Centered mobile shell for sales UI */}
      <div className="mx-auto max-w-[430px] min-h-screen flex flex-col bg-white shadow-xl">
        {children}
      </div>
    </div>
  )
}
