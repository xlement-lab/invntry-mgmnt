'use client'

import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import BottomNav from '@/components/sales/BottomNav'
import { resetData } from '@/lib/store'

export default function SalesProfilePage() {
  const { currentUser, logout, projects } = useApp()
  const router = useRouter()

  const myProjects = projects.filter(p => p.assignedSalesId === currentUser?.id)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const statusCounts = myProjects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="bg-emerald-600 text-white px-4 pt-12 pb-8 text-center">
        <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold mb-3">
          {currentUser?.initials}
        </div>
        <h1 className="text-xl font-bold">{currentUser?.name}</h1>
        <p className="text-emerald-200 text-sm mt-1">{currentUser?.email}</p>
        <span className="inline-block mt-2 bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">
          Sales Executive
        </span>
      </div>

      <div className="px-4 py-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">My Pipeline</h2>
        <div className="space-y-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
              <span className="text-slate-700 text-sm">{status}</span>
              <span className="font-bold text-emerald-700">{count}</span>
            </div>
          ))}
          {myProjects.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">No projects yet</p>
          )}
        </div>

        <div className="pt-4 space-y-3">
          <button
            onClick={() => { resetData(); window.location.href = '/login' }}
            className="w-full py-3.5 border border-gray-200 rounded-2xl text-slate-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Reset Demo Data
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
