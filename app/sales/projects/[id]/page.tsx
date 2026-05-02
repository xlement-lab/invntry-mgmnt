'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import StatusBadge from '@/components/ui/StatusBadge'
import BottomNav from '@/components/sales/BottomNav'
import { ProjectStatus, LightingFixture } from '@/lib/types'
import { formatDate, calcTotalWatts, formatWatts, formatCurrency } from '@/lib/utils'

const EDITABLE_STATUSES: ProjectStatus[] = ['Draft', 'In Progress', 'Rework Required']

export default function SalesProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { getProject, updateProject, currentUser } = useApp()
  const router = useRouter()
  const project = getProject(id)

  const [activeTab, setActiveTab] = useState<'overview' | 'fixtures' | 'notes' | 'docs'>('overview')
  const [salesNotes, setSalesNotes] = useState(project?.salesNotes ?? '')
  const [followUpNotes, setFollowUpNotes] = useState(project?.followUpNotes ?? '')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-500">Project not found</p>
        <Link href="/sales/dashboard" className="text-emerald-600 font-medium">← Back to Dashboard</Link>
      </div>
    )
  }

  const canEdit = EDITABLE_STATUSES.includes(project.status)
  const canSubmit = project.status === 'In Progress' && project.lightingFixtures.length > 0
  const canResubmit = project.status === 'Rework Required'
  const totalWatts = calcTotalWatts(project.lightingFixtures)

  const handleSaveNotes = async () => {
    setIsSavingNotes(true)
    await new Promise(r => setTimeout(r, 400))
    updateProject(id, { salesNotes, followUpNotes })
    setIsSavingNotes(false)
  }

  const handleSubmit = () => {
    updateProject(id, { status: 'Submitted' })
    setShowSubmitConfirm(false)
    router.push('/sales/dashboard')
  }

  const handleMarkInProgress = () => {
    if (project.status === 'Draft') {
      updateProject(id, { status: 'In Progress' })
    }
  }

  const TABS = [
    { key: 'overview', label: 'Overview', icon: '📋' },
    { key: 'fixtures', label: `Fixtures (${project.lightingFixtures.length})`, icon: '💡' },
    { key: 'notes', label: 'Notes', icon: '📝' },
    { key: 'docs', label: `Docs (${project.documents.length})`, icon: '📄' },
  ] as const

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 pt-12 pb-0 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/sales/dashboard" className="text-slate-500 hover:text-slate-700 text-xl">‹</Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-slate-900 truncate">{project.company.name}</h1>
            <p className="text-slate-400 text-xs">{project.facility.name}</p>
          </div>
          <StatusBadge status={project.status} size="sm" />
        </div>
        {/* Tabs */}
        <div className="flex overflow-x-auto -mx-4 px-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 pb-2 px-2 mr-4 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-transparent text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="px-4 py-4 space-y-4">
            {/* Status alert for rework */}
            {project.status === 'Rework Required' && project.reviewComments && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <p className="text-red-700 font-semibold text-sm mb-1">⚠️ Rework Required</p>
                <p className="text-red-600 text-sm">{project.reviewComments}</p>
              </div>
            )}

            {/* Quick stats */}
            {project.lightingFixtures.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                <StatCard label="Fixture Types" value={project.lightingFixtures.length.toString()} icon="💡" />
                <StatCard label="Total Power" value={formatWatts(totalWatts)} icon="⚡" />
                <StatCard label="Total Units" value={project.lightingFixtures.reduce((s, f) => s + f.totalFixture, 0).toString()} icon="🔢" />
              </div>
            )}

            {/* Company */}
            <InfoCard title="Company" icon="🏢">
              <InfoRow label="Name" value={project.company.name} />
              <InfoRow label="Email" value={project.company.email} />
            </InfoCard>

            {/* Contacts */}
            <InfoCard title="Contact Persons" icon="👥">
              {project.contacts.map((c, i) => (
                <div key={c.id}>
                  {i > 0 && <div className="border-t border-gray-100 my-2 pt-2" />}
                  <InfoRow label="Name" value={`${c.salutation} ${c.fullName}`} />
                  <InfoRow label="Role" value={c.designation} />
                  <InfoRow label="Phone" value={c.phone} />
                  {c.address && <InfoRow label="Address" value={c.address} />}
                </div>
              ))}
            </InfoCard>

            {/* Facility */}
            <InfoCard title="Facility" icon="🏭">
              <InfoRow label="Name" value={project.facility.name} />
              <InfoRow label="Acct #" value={project.facility.electricityAccountNumber} />
            </InfoCard>

            {/* Subsidy info (read-only for sales) */}
            <InfoCard title="Subsidy Information" icon="💰">
              {project.subsidyAmount ? (
                <>
                  <InfoRow label="Amount" value={formatCurrency(project.subsidyAmount)} highlight />
                  <InfoRow label="Proposal #" value={project.subsidyProposalNumber ?? '—'} />
                  <InfoRow label="PSPX #" value={project.subsidyPspxNumber ?? '—'} />
                </>
              ) : (
                <p className="text-slate-400 text-sm">No subsidy data entered yet</p>
              )}
              <p className="text-slate-300 text-xs mt-2">Managed by Admin</p>
            </InfoCard>

            {/* Timeline */}
            <div className="text-xs text-slate-400 space-y-1 pb-2">
              <p>Created: {formatDate(project.createdAt)}</p>
              <p>Last updated: {formatDate(project.updatedAt)}</p>
            </div>
          </div>
        )}

        {/* FIXTURES TAB */}
        {activeTab === 'fixtures' && (
          <div className="px-4 py-4 space-y-3">
            {canEdit && (
              <Link
                href={`/sales/projects/${id}/audit`}
                className="block w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-semibold text-center text-sm hover:bg-emerald-700 transition-colors"
              >
                + Add / Edit Fixtures
              </Link>
            )}
            {project.lightingFixtures.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">💡</div>
                <p className="text-slate-500 font-medium">No fixtures yet</p>
                <p className="text-slate-400 text-sm mt-1">Tap above to start the lighting audit</p>
              </div>
            ) : (
              project.lightingFixtures.map((f) => <FixtureCard key={f.id} fixture={f} />)
            )}
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="px-4 py-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Sales Notes</label>
              <textarea
                value={salesNotes}
                onChange={e => setSalesNotes(e.target.value)}
                placeholder="Enter your observations, client preferences, etc."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 resize-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Follow-up Notes</label>
              <textarea
                value={followUpNotes}
                onChange={e => setFollowUpNotes(e.target.value)}
                placeholder="Upcoming meetings, calls, action items..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 resize-none transition-all"
              />
            </div>
            {project.managementNotes && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                <p className="text-violet-700 font-semibold text-xs mb-1">Management Notes (read-only)</p>
                <p className="text-violet-600 text-sm">{project.managementNotes}</p>
              </div>
            )}
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {isSavingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        )}

        {/* DOCS TAB */}
        {activeTab === 'docs' && (
          <div className="px-4 py-4 space-y-3">
            {project.documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📄</div>
                <p className="text-slate-500 font-medium">No documents yet</p>
                <p className="text-slate-400 text-sm mt-1">Documents will appear here once uploaded by Admin</p>
              </div>
            ) : (
              project.documents.map(doc => (
                <div key={doc.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{doc.type === 'site_image' ? '📸' : doc.type === 'quotation' ? '💰' : '📄'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{doc.name}</p>
                    <p className="text-slate-400 text-xs">{doc.size} · {formatDate(doc.uploadedAt)}</p>
                  </div>
                  <span className="text-slate-400 text-lg">↓</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom action buttons */}
      <div className="sticky bottom-16 bg-white border-t border-gray-100 p-4">
        {project.status === 'Draft' && (
          <button
            onClick={handleMarkInProgress}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Field Data Collection
          </button>
        )}
        {(canSubmit) && (
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Submit for Review →
          </button>
        )}
        {canResubmit && project.lightingFixtures.length > 0 && (
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="w-full py-4 bg-amber-600 text-white rounded-2xl font-semibold hover:bg-amber-700 transition-colors"
          >
            Re-submit for Review →
          </button>
        )}
        {project.status === 'In Progress' && project.lightingFixtures.length === 0 && (
          <Link
            href={`/sales/projects/${id}/audit`}
            className="block w-full py-4 bg-emerald-600 text-white rounded-2xl font-semibold text-center hover:bg-emerald-700 transition-colors"
          >
            Start Lighting Audit →
          </Link>
        )}
      </div>

      {/* Submit confirmation modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-0">
          <div className="bg-white rounded-t-3xl w-full max-w-[430px] p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Submit for Review?</h3>
            <p className="text-slate-500 text-sm mb-6">
              This will lock editing until the Admin Manager reviews the submission. Make sure all data is complete.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-3.5 border border-gray-300 rounded-2xl text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3.5 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className="font-bold text-slate-900 text-base">{value}</div>
      <div className="text-slate-400 text-[10px]">{label}</div>
    </div>
  )
}

function InfoCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span>{icon}</span>
        <span className="font-semibold text-slate-800 text-sm">{title}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-slate-400 min-w-20 flex-shrink-0">{label}</span>
      <span className={`flex-1 ${highlight ? 'text-emerald-700 font-bold' : 'text-slate-800'}`}>{value}</span>
    </div>
  )
}

function FixtureCard({ fixture }: { fixture: LightingFixture }) {
  const power = fixture.wattage * fixture.lampCount * fixture.totalFixture
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-slate-900 text-sm">{fixture.fixtureType}</p>
          <p className="text-emerald-600 text-xs font-medium">{fixture.area}</p>
        </div>
        <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
          {formatWatts(power)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
        {fixture.mountingType !== 'N/A' && <MiniRow label="Mount" value={fixture.mountingType} />}
        <MiniRow label="Lamps/unit" value={fixture.lampCount.toString()} />
        <MiniRow label="Wattage" value={`${fixture.wattage}W`} />
        <MiniRow label="Voltage" value={`${fixture.voltage}V`} />
        <MiniRow label="Total units" value={fixture.totalFixture.toString()} />
      </div>
    </div>
  )
}

function MiniRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1 text-xs">
      <span className="text-slate-400">{label}:</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  )
}
