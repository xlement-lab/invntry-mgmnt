'use client'

import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { mockUsers } from '@/lib/store'
import { User, UserRole } from '@/lib/types'
import { resetData } from '@/lib/store'

const ROLE_LABELS: Record<UserRole, string> = {
  sales: 'Sales Executive',
  admin: 'Admin Manager',
  super_admin: 'Super Admin',
}

const ROLE_COLORS: Record<UserRole, string> = {
  sales: 'bg-blue-100 text-blue-700 border-blue-200',
  admin: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  super_admin: 'bg-violet-100 text-violet-700 border-violet-200',
}

const ROLE_ICON: Record<UserRole, string> = {
  sales: '📱',
  admin: '🖥️',
  super_admin: '⚙️',
}

export default function LoginPage() {
  const { login } = useApp()
  const router = useRouter()

  const handleLogin = (user: User) => {
    login(user)
    if (user.role === 'sales') {
      router.push('/sales/dashboard')
    } else {
      router.push('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-3xl">💡</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">LightAudit Pro</h1>
          <p className="text-slate-500 mt-1 text-sm">Lighting Audit & Sales Workflow</p>
        </div>

        {/* Demo Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-center">
          <p className="text-amber-700 text-xs font-medium">Demo Mode — Select a user to continue</p>
        </div>

        {/* User cards */}
        <div className="space-y-3">
          {mockUsers.map(user => (
            <button
              key={user.id}
              onClick={() => handleLogin(user)}
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:border-emerald-400 hover:shadow-md transition-all duration-150 group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-bold text-sm">{user.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{user.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_COLORS[user.role]}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">{user.email}</p>
              </div>
              <div className="text-lg flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                {ROLE_ICON[user.role]}
              </div>
            </button>
          ))}
        </div>

        {/* Reset demo data */}
        <div className="mt-6 text-center">
          <button
            onClick={() => { resetData(); window.location.reload() }}
            className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
          >
            Reset demo data
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Sales users see mobile-first UI &middot; Admin users see dashboard UI
        </p>
      </div>
    </div>
  )
}
