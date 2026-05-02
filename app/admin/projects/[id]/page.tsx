'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import StatusBadge from '@/components/ui/StatusBadge'
import { mockUsers } from '@/lib/store'
import { LightingFixture, ProjectStatus, UploadedDocument } from '@/lib/types'
import { formatDate, calcTotalWatts, formatWatts, formatCurrency, generateId } from '@/lib/utils'

const DOC_ICONS: Record<UploadedDocument['type'], string> = {
  quotation: '💰', proposal: '📄', subsidy: '📋', site_image: '📸', customer_doc: '📑',
}

const NEXT_STATUSES: Partial<Record<ProjectStatus, ProjectStatus[]>> = {
  'Validated': ['Quotation Generated'],
  'Quotation Generated': ['Proposal Sent'],
  'Proposal Sent': ['Negotiation', 'Closed Won', 'Closed Lost'],
  'Negotiation': ['Closed Won', 'Closed Lost'],
}

export default function AdminProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { getProject, updateProject } = useApp()
  const router = useRouter()

  const project = getProject(id)
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'subsidy' | 'docs' | 'notes'>('overview')

  // Review state
  const [reviewComment, setReviewComment] = useState(project?.reviewComments ?? '')
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)

  // Subsidy state
  const [subsidyAmount, setSubsidyAmount] = useState(project?.subsidyAmount?.toString() ?? '')
  const [subsidyProposal, setSubsidyProposal] = useState(project?.subsidyProposalNumber ?? '')
  const [subsidyPspx, setSubsidyPspx] = useState(project?.subsidyPspxNumber ?? '')
  const [managementNotes, setManagementNotes] = useState(project?.managementNotes ?? '')
  const [subsidySaved, setSubsidySaved] = useState(false)

  // Status management
  const [statusAction, setStatusAction] = useState<ProjectStatus | ''>('')
  const [followUpNotes, setFollowUpNotes] = useState(project?.followUpNotes ?? '')

  // Doc upload simulation
  const [showDocUpload, setShowDocUpload] = useState(false)
  const [docName, setDocName] = useState('')
  const [docType, setDocType] = useState<UploadedDocument['type']>('quotation')

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Project not found</p>
        <Link href="/admin/projects" className="text-emerald-600 mt-2 inline-block">← Back</Link>
      </div>
    )
  }

  const salesName = mockUsers.find(u => u.id === project.assignedSalesId)?.name ?? 'Unknown'
  const totalWatts = calcTotalWatts(project.lightingFixtures)
  const totalUnits = project.lightingFixtures.reduce((s, f) => s + f.totalFixture, 0)

  const handleApprove = () => {
    updateProject(id, { status: 'Validated', reviewComments: '' })
    setShowApproveConfirm(false)
  }

  const handleReject = () => {
    if (!reviewComment.trim()) return
    updateProject(id, { status: 'Rework Required', reviewComments: reviewComment })
    setShowRejectForm(false)
  }

  const handleSaveSubsidy = async () => {
    updateProject(id, {
      subsidyAmount: subsidyAmount ? Number(subsidyAmount) : undefined,
      subsidyProposalNumber: subsidyProposal || undefined,
      subsidyPspxNumber: subsidyPspx || undefined,
      managementNotes,
    })
    setSubsidySaved(true)
    setTimeout(() => setSubsidySaved(false), 2000)
  }

  const handleStatusChange = () => {
    if (!statusAction) return
    updateProject(id, { status: statusAction, followUpNotes })
    setStatusAction('')
  }

  const handleDocUpload = () => {
    if (!docName.trim()) return
    const newDoc: UploadedDocument = {
      id: generateId(),
      name: docName.trim(),
      type: docType,
      url: '#',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Robert Kim',
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
    }
    updateProject(id, { documents: [...project.documents, newDoc] })
    setDocName('')
    setShowDocUpload(false)
  }

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'audit', label: `Audit (${project.lightingFixtures.length})` },
    { key: 'subsidy', label: 'Subsidy' },
    { key: 'docs', label: `Documents (${project.documents.length})` },
    { key: 'notes', label: 'Notes' },
  ] as const

  const nextStatuses = NEXT_STATUSES[project.status] ?? []

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/admin/projects" className="hover:text-slate-700">Projects</Link>
        <span>›</span>
        <span className="text-slate-800 font-medium">{project.company.name}</span>
      </div>

      {/* Page header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{project.company.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span>🏭 {project.facility.name}</span>
              <span>👤 {salesName}</span>
              <span>📅 Updated {formatDate(project.updatedAt)}</span>
            </div>
          </div>

          {/* Action buttons per status */}
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            {project.status === 'Submitted' && (
              <>
                <button
                  onClick={() => setShowApproveConfirm(true)}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="px-5 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"
                >
                  ❌ Request Rework
                </button>
              </>
            )}
            {nextStatuses.length > 0 && (
              <select
                value={statusAction}
                onChange={e => setStatusAction(e.target.value as ProjectStatus)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Move to status...</option>
                {nextStatuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
            {statusAction && (
              <button
                onClick={handleStatusChange}
                className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-semibold text-sm hover:bg-slate-900 transition-colors"
              >
                Confirm
              </button>
            )}
          </div>
        </div>

        {/* Rework comment display */}
        {project.status === 'Rework Required' && project.reviewComments && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-semibold text-sm mb-1">Rework Notes Sent to Sales:</p>
            <p className="text-red-600 text-sm">{project.reviewComments}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6 pt-4 flex gap-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap -mb-px ${
                activeTab === tab.key
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminInfoCard title="Company" icon="🏢">
                <AdminRow label="Name" value={project.company.name} />
                <AdminRow label="Email" value={project.company.email} />
              </AdminInfoCard>
              <AdminInfoCard title="Facility" icon="🏭">
                <AdminRow label="Name" value={project.facility.name} />
                <AdminRow label="Acct #" value={project.facility.electricityAccountNumber} />
              </AdminInfoCard>
              {project.contacts.map((c, i) => (
                <AdminInfoCard key={c.id} title={`Contact ${i + 1}`} icon="👤">
                  <AdminRow label="Name" value={`${c.salutation} ${c.fullName}`} />
                  <AdminRow label="Role" value={c.designation} />
                  <AdminRow label="Phone" value={c.phone} />
                  {c.address && <AdminRow label="Address" value={c.address} />}
                </AdminInfoCard>
              ))}
              <AdminInfoCard title="Audit Summary" icon="💡">
                <AdminRow label="Fixture Types" value={project.lightingFixtures.length.toString()} />
                <AdminRow label="Total Units" value={totalUnits.toString()} />
                <AdminRow label="Total Power" value={formatWatts(totalWatts)} />
                <AdminRow label="Assigned To" value={salesName} />
              </AdminInfoCard>
            </div>
          )}

          {/* AUDIT TAB */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              {project.lightingFixtures.length === 0 ? (
                <p className="text-slate-400 text-center py-12">No fixtures entered yet</p>
              ) : (
                <>
                  {/* Summary row */}
                  <div className="grid grid-cols-3 gap-4 mb-2">
                    <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-200">
                      <div className="text-2xl font-bold text-emerald-800">{project.lightingFixtures.length}</div>
                      <div className="text-emerald-600 text-xs">Fixture Types</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                      <div className="text-2xl font-bold text-blue-800">{totalUnits}</div>
                      <div className="text-blue-600 text-xs">Total Units</div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
                      <div className="text-2xl font-bold text-amber-800">{formatWatts(totalWatts)}</div>
                      <div className="text-amber-600 text-xs">Total Power</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {['Area', 'Fixture Type', 'Mounting', 'Lamps', 'Watts', 'Volts', 'Units', 'Total Power'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {project.lightingFixtures.map((f: LightingFixture) => (
                          <tr key={f.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{f.area}</td>
                            <td className="px-4 py-3 text-slate-600">{f.fixtureType}</td>
                            <td className="px-4 py-3 text-slate-500">{f.mountingType}</td>
                            <td className="px-4 py-3 text-slate-600">{f.lampCount}</td>
                            <td className="px-4 py-3 text-slate-600">{f.wattage}W</td>
                            <td className="px-4 py-3 text-slate-600">{f.voltage}V</td>
                            <td className="px-4 py-3 text-slate-600">{f.totalFixture}</td>
                            <td className="px-4 py-3 font-semibold text-amber-700">{formatWatts(f.wattage * f.lampCount * f.totalFixture)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                        <tr>
                          <td colSpan={6} className="px-4 py-3 font-bold text-slate-700">TOTALS</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{totalUnits}</td>
                          <td className="px-4 py-3 font-bold text-amber-700">{formatWatts(totalWatts)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* SUBSIDY TAB */}
          {activeTab === 'subsidy' && (
            <div className="max-w-lg space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700">
                <strong>Admin Only:</strong> These fields are editable only by the Admin Manager and visible (read-only) to Sales.
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Subsidy Amount (CAD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input
                    type="number"
                    value={subsidyAmount}
                    onChange={e => setSubsidyAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400"
                  />
                </div>
                {subsidyAmount && <p className="text-emerald-600 text-sm font-medium">{formatCurrency(Number(subsidyAmount))}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Subsidy Proposal #</label>
                <input
                  type="text"
                  value={subsidyProposal}
                  onChange={e => setSubsidyProposal(e.target.value)}
                  placeholder="e.g. PROP-2024-0012"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Subsidy PSPX #</label>
                <input
                  type="text"
                  value={subsidyPspx}
                  onChange={e => setSubsidyPspx(e.target.value)}
                  placeholder="e.g. PSPX-2024-0047"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Management Notes</label>
                <textarea
                  value={managementNotes}
                  onChange={e => setManagementNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes for admin team..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 resize-none"
                />
              </div>

              <button
                onClick={handleSaveSubsidy}
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  subsidySaved
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {subsidySaved ? '✅ Saved!' : 'Save Subsidy Information'}
              </button>
            </div>
          )}

          {/* DOCS TAB */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <button
                onClick={() => setShowDocUpload(true)}
                className="w-full py-3 border-2 border-dashed border-emerald-400 rounded-xl text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors"
              >
                + Upload Document
              </button>

              {project.documents.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-3">📂</div>
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                project.documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center flex-shrink-0 text-2xl">
                      {DOC_ICONS[doc.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{doc.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {doc.size} · Uploaded by {doc.uploadedBy} · {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 text-sm px-3 py-1.5 border border-gray-200 rounded-lg bg-white">
                      ↓ Download
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-800">Sales Notes</h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 min-h-[120px]">
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">{project.salesNotes || <span className="text-slate-400">No sales notes</span>}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-800">Follow-up Notes</h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 min-h-[120px]">
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">{project.followUpNotes || <span className="text-slate-400">No follow-up notes</span>}</p>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <h3 className="font-semibold text-slate-800">Management Notes (Admin)</h3>
                <textarea
                  value={managementNotes}
                  onChange={e => setManagementNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <button
                  onClick={handleSaveSubsidy}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Save Notes
                </button>
              </div>
              <div className="md:col-span-2 space-y-2">
                <h3 className="font-semibold text-slate-800">Update Follow-up Notes</h3>
                <textarea
                  value={followUpNotes}
                  onChange={e => setFollowUpNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <button
                  onClick={() => updateProject(id, { followUpNotes })}
                  className="px-5 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  Save Follow-up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* APPROVE MODAL */}
      {showApproveConfirm && (
        <Modal title="Approve Submission?" onClose={() => setShowApproveConfirm(false)}>
          <p className="text-slate-500 text-sm mb-6">
            This will mark the project as <strong>Validated</strong> and notify the sales team. Data is confirmed as correct.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowApproveConfirm(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-slate-700 font-semibold text-sm">Cancel</button>
            <button onClick={handleApprove} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors">Confirm Approve</button>
          </div>
        </Modal>
      )}

      {/* REJECT MODAL */}
      {showRejectForm && (
        <Modal title="Request Rework" onClose={() => setShowRejectForm(false)}>
          <div className="space-y-4 mb-6">
            <p className="text-slate-500 text-sm">
              Provide specific feedback for the sales team. Be clear about what needs to be corrected.
            </p>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              rows={4}
              placeholder="e.g. Missing area data for lobby fixtures. Please verify wattage for highbay units..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            {!reviewComment.trim() && <p className="text-red-500 text-xs">Comment is required</p>}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowRejectForm(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-slate-700 font-semibold text-sm">Cancel</button>
            <button onClick={handleReject} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors">Send for Rework</button>
          </div>
        </Modal>
      )}

      {/* DOC UPLOAD MODAL */}
      {showDocUpload && (
        <Modal title="Upload Document" onClose={() => setShowDocUpload(false)}>
          <div className="space-y-4 mb-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Document Name</label>
              <input
                type="text"
                value={docName}
                onChange={e => setDocName(e.target.value)}
                placeholder="e.g. Quotation_v1.pdf"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Document Type</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value as UploadedDocument['type'])}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="quotation">Quotation</option>
                <option value="proposal">Proposal</option>
                <option value="subsidy">Subsidy Document</option>
                <option value="site_image">Site Images</option>
                <option value="customer_doc">Customer Document</option>
              </select>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-slate-400 text-sm">
              <p className="text-2xl mb-1">📎</p>
              <p>Demo mode — file upload simulated</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowDocUpload(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-slate-700 font-semibold text-sm">Cancel</button>
            <button onClick={handleDocUpload} disabled={!docName.trim()} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors">Upload</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function AdminInfoCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <span>{icon}</span>
        <span className="font-semibold text-slate-800">{title}</span>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function AdminRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-slate-400 min-w-20 flex-shrink-0">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>
        <div className="px-6 pt-5 pb-6">{children}</div>
      </div>
    </div>
  )
}
