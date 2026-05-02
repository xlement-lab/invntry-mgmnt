'use client'

import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import StatusBadge from '@/components/ui/StatusBadge'
import { mockUsers } from '@/lib/store'
import { ProjectStatus } from '@/lib/types'
import { formatDate, calcTotalWatts, formatWatts } from '@/lib/utils'

const PIPELINE_STATUSES: ProjectStatus[] = ['Submitted', 'Validated', 'Rework Required', 'Quotation Generated', 'Proposal Sent', 'Negotiation']

export default function AdminDashboard() {
  const { projects, currentUser } = useApp()

  const needs_action = projects.filter(p => p.status === 'Submitted')
  const rework = projects.filter(p => p.status === 'Rework Required')
  const won = projects.filter(p => p.status === 'Closed Won')
  const active = projects.filter(p => PIPELINE_STATUSES.includes(p.status))

  const stats = [
    { label: 'Awaiting Review', value: needs_action.length, color: 'bg-violet-50 text-violet-700 border-violet-200', icon: '📥', urgent: needs_action.length > 0 },
    { label: 'Active Pipeline', value: active.length, color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🔄', urgent: false },
    { label: 'Need Rework', value: rework.length, color: 'bg-red-50 text-red-700 border-red-200', icon: '⚠️', urgent: rework.length > 0 },
    { label: 'Closed Won', value: won.length, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🏆', urgent: false },
    { label: 'Total Projects', value: projects.length, color: 'bg-slate-50 text-slate-700 border-slate-200', icon: '📋', urgent: false },
  ]

  const getSalesName = (id: string) => mockUsers.find(u => u.id === id)?.name ?? 'Unknown'

  const recentSubmissions = projects
    .filter(p => p.status === 'Submitted')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const allRecent = projects
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8)

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Good {getTimeOfDay()}, {currentUser?.name.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here&apos;s your lighting audit pipeline overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`border rounded-2xl p-5 ${s.color} ${s.urgent ? 'ring-2 ring-offset-2 ring-current' : ''}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm font-medium mt-1 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Awaiting review */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Awaiting Review</h2>
              <Link href="/admin/projects?status=Submitted" className="text-emerald-600 text-sm hover:underline">View all</Link>
            </div>
            {recentSubmissions.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-slate-500">No submissions pending review</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentSubmissions.map(p => (
                  <Link key={p.id} href={`/admin/projects/${p.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{p.company.name}</p>
                      <p className="text-slate-500 text-xs">{p.facility.name} · {getSalesName(p.assignedSalesId)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <StatusBadge status={p.status} size="sm" />
                      <p className="text-slate-400 text-xs mt-1">{formatDate(p.updatedAt)}</p>
                    </div>
                    <span className="text-slate-300">›</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent Activity</h2>
              <Link href="/admin/projects" className="text-emerald-600 text-sm hover:underline">All projects</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {allRecent.map(p => (
                <Link key={p.id} href={`/admin/projects/${p.id}`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{p.company.name}</p>
                    <p className="text-slate-400 text-xs">{getSalesName(p.assignedSalesId)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StatusBadge status={p.status} size="sm" />
                    <p className="text-slate-400 text-[10px] mt-1">{formatDate(p.updatedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Sales team overview */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-slate-900">Sales Team</h2>
            </div>
            <div className="px-5 py-4 space-y-4">
              {mockUsers.filter(u => u.role === 'sales').map(user => {
                const userProjects = projects.filter(p => p.assignedSalesId === user.id)
                const activeCount = userProjects.filter(p => PIPELINE_STATUSES.includes(p.status) || p.status === 'Draft' || p.status === 'In Progress').length
                return (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{user.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{user.name}</p>
                      <div className="flex gap-2 text-xs text-slate-500">
                        <span>{userProjects.length} total</span>
                        <span>·</span>
                        <span>{activeCount} active</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick metrics */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-slate-900">Portfolio Metrics</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              <MetricRow
                label="Total Fixture Types"
                value={projects.reduce((s, p) => s + p.lightingFixtures.length, 0).toString()}
              />
              <MetricRow
                label="Total Power Audited"
                value={formatWatts(projects.reduce((s, p) => s + calcTotalWatts(p.lightingFixtures), 0))}
              />
              <MetricRow
                label="Won / Total"
                value={`${won.length} / ${projects.length}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
