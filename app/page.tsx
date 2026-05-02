'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'

export default function HomePage() {
  const { currentUser, isLoading } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!currentUser) {
      router.replace('/login')
      return
    }
    if (currentUser.role === 'sales') {
      router.replace('/sales/dashboard')
    } else {
      router.replace('/admin/dashboard')
    }
  }, [currentUser, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    </div>
  )
}
