'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import StatusBadge from '@/components/ui/StatusBadge'
import { ProjectStatus, STATUS_COLORS } from '@/lib/types'
import { mockUsers } from '@/lib/store'
import { formatDate, calcTotalWatts, formatWatts } from '@/lib/utils'

const ALL_STATUSES: ProjectStatus[] = [
  'Draft', 'In Progress', 'Submitted', 'Validated', 'Rework Required',
  'Quotation Generated', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost',
]

export default function AdminProjectsPage() {
  const { projects } = useApp()
  const searchParams = useSearchParams()
  const defaultStatus = (searchParams.get('status') as ProjectStatus | null) ?? 'All'

  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>(defaultStatus as ProjectStatus | 'All')
  const [salesFilter, setSalesFilter] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'updatedAt' | 'company' | 'status'>('updatedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const salesUsers = mockUsers.filter(u => u.role === 'sales')

  const filtered = useMemo(() => {
    let result = [...projects]
    if (statusFilter !== 'All') result = result.filter(p => p.status === statusFilter)
    if (salesFilter !== 'All') result = result.filter(p => p.assignedSalesId === salesFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.company.name.toLowerCase().includes(q) ||
        p.facility.name.toLowerCase().includes(q) ||
        p.company.email.toLowerCase().includes(q)
      )
    }
    result.sort((a, b) => {
      let va = '', vb = ''
      if (sortKey === 'updatedAt') { va = a.updatedAt; vb = b.updatedAt }
      else if (sortKey === 'company') { va = a.company.name; vb = b.company.name }
      else if (sortKey === 'status') { va = a.status; vb = b.status }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
    return result
  }, [projects, statusFilter, salesFilter, search, sortKey, sortDir])

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const getSalesName = (id: string) => mockUsers.find(u => u.id === id)?.name ?? '—'

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">All Projects</h1>
        <p className="text-slate-500 mt-1">{filtered.length} of {projects.length} projects</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search company, facility..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <select
            value={salesFilter}
            onChange={e => setSalesFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Sales Reps</option>
            {salesUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ProjectStatus | 'All')}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Statuses</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Status chips */}
        <div className="flex flex-wrap gap-2">
          {(['All', ...ALL_STATUSES] as (ProjectStatus | 'All')[]).map(s => {
            const count = s === 'All' ? projects.length : projects.filter(p => p.status === s).length
            if (count === 0 && s !== 'All') return null
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  statusFilter === s
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : s === 'All'
                    ? 'bg-white text-slate-600 border-gray-200 hover:border-emerald-300'
                    : `${STATUS_COLORS[s as ProjectStatus]} border-transparent hover:opacity-80`
                }`}
              >
                {s} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <Th label="Company" sortKey="company" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Facility</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Sales Rep</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Fixtures</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Power</th>
                <Th label="Status" sortKey="status" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <Th label="Updated" sortKey="updatedAt" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    No projects match your filters
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-900 text-sm">{p.company.name}</p>
                    <p className="text-slate-400 text-xs">{p.company.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{p.facility.name}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{getSalesName(p.assignedSalesId)}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{p.lightingFixtures.length}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{formatWatts(calcTotalWatts(p.lightingFixtures))}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-400">{formatDate(p.updatedAt)}</td>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Th({ label, sortKey, current, dir, onClick }: {
  label: string; sortKey: string; current: string; dir: 'asc' | 'desc'
  onClick: (k: any) => void
}) {
  const active = current === sortKey
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none"
      onClick={() => onClick(sortKey)}
    >
      {label} {active ? (dir === 'asc' ? '↑' : '↓') : ''}
    </th>
  )
}
