'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import BottomNav from '@/components/sales/BottomNav'
import StatusBadge from '@/components/ui/StatusBadge'
import { ProjectStatus, STATUS_COLORS } from '@/lib/types'
import { formatDate } from '@/lib/utils'

const STATUS_FILTERS: (ProjectStatus | 'All')[] = [
  'All', 'Draft', 'In Progress', 'Submitted', 'Rework Required', 'Validated', 'Quotation Generated', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost',
]

export default function SalesDashboard() {
  const { currentUser, projects, logout } = useApp()
  const router = useRouter()
  const [filter, setFilter] = useState<ProjectStatus | 'All'>('All')
  const [search, setSearch] = useState('')

  const myProjects = projects.filter(p => p.assignedSalesId === currentUser?.id)

  const filtered = myProjects.filter(p => {
    const matchFilter = filter === 'All' || p.status === filter
    const matchSearch = search === '' ||
      p.company.name.toLowerCase().includes(search.toLowerCase()) ||
      p.facility.name.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const stats = {
    total: myProjects.length,
    active: myProjects.filter(p => ['Draft', 'In Progress', 'Submitted', 'Validated', 'Rework Required'].includes(p.status)).length,
    rework: myProjects.filter(p => p.status === 'Rework Required').length,
    won: myProjects.filter(p => p.status === 'Closed Won').length,
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-emerald-200 text-xs">Welcome back,</p>
            <h1 className="text-xl font-bold">{currentUser?.name.split(' ')[0]}</h1>
          </div>
          <button
            onClick={() => { logout(); router.push('/login') }}
            className="w-9 h-9 bg-emerald-700 rounded-full flex items-center justify-center text-sm font-bold hover:bg-emerald-800 transition-colors"
          >
            {currentUser?.initials}
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: 'Total', value: stats.total, color: 'bg-white/20' },
            { label: 'Active', value: stats.active, color: 'bg-white/20' },
            { label: 'Rework', value: stats.rework, color: stats.rework > 0 ? 'bg-red-500/80' : 'bg-white/20' },
            { label: 'Won', value: stats.won, color: 'bg-white/20' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-2 text-center`}>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-emerald-100 text-[10px]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search company or facility..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide bg-white border-b border-gray-100">
        {STATUS_FILTERS.slice(0, 6).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === s
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-gray-200 hover:border-emerald-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Project list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-slate-500 font-medium">No projects found</p>
            <p className="text-slate-400 text-sm mt-1">
              {filter !== 'All' ? 'Try a different filter' : 'Create your first project'}
            </p>
            <Link
              href="/sales/projects/new"
              className="inline-block mt-4 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              + New Project
            </Link>
          </div>
        ) : (
          filtered.map(project => (
            <Link key={project.id} href={`/sales/projects/${project.id}`}>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-emerald-300 hover:shadow-sm transition-all active:scale-[0.99]">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 leading-tight">{project.company.name}</h3>
                  <StatusBadge status={project.status} size="sm" />
                </div>
                <p className="text-slate-500 text-xs mb-3">
                  🏭 {project.facility.name}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {project.lightingFixtures.length > 0
                      ? `${project.lightingFixtures.length} fixture type${project.lightingFixtures.length > 1 ? 's' : ''}`
                      : 'No fixtures yet'}
                  </span>
                  <span>{formatDate(project.updatedAt)}</span>
                </div>
                {project.status === 'Rework Required' && project.reviewComments && (
                  <div className="mt-3 bg-red-50 rounded-lg p-2.5 border border-red-100">
                    <p className="text-red-600 text-xs font-medium">⚠️ Review Comment</p>
                    <p className="text-red-500 text-xs mt-0.5 line-clamp-2">{project.reviewComments}</p>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}
