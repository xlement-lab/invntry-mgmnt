'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import { LightingFixture, FIXTURE_TYPES, MOUNTING_APPLICABLE_FIXTURES, MountingType, FixtureTypeName } from '@/lib/types'
import { generateId, formatWatts, calcTotalWatts } from '@/lib/utils'

const MOUNTING_TYPES: MountingType[] = ['Recessed', 'Ceiling Mount', 'Suspended']
const COMMON_VOLTAGES = [120, 208, 240, 277, 347, 480, 600]

function emptyFixture(): Partial<LightingFixture> {
  return {
    id: generateId(),
    area: '',
    fixtureType: '4x2',
    mountingType: 'Recessed',
    lampCount: 1,
    wattage: 32,
    voltage: 120,
    totalFixture: 1,
  }
}

export default function AuditPage() {
  const { id } = useParams<{ id: string }>()
  const { getProject, updateProject } = useApp()
  const router = useRouter()

  const project = getProject(id)
  const [fixtures, setFixtures] = useState<LightingFixture[]>(project?.lightingFixtures ?? [])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<LightingFixture>>(emptyFixture())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (!project) return null

  const needsMounting = MOUNTING_APPLICABLE_FIXTURES.includes(draft.fixtureType as FixtureTypeName)

  const validateDraft = () => {
    const e: Record<string, string> = {}
    if (!draft.area?.trim()) e.area = 'Area is required'
    if (!draft.lampCount || draft.lampCount < 1) e.lampCount = 'Min 1 lamp'
    if (!draft.wattage || draft.wattage < 1) e.wattage = 'Enter wattage'
    if (!draft.voltage || draft.voltage < 1) e.voltage = 'Enter voltage'
    if (!draft.totalFixture || draft.totalFixture < 1) e.totalFixture = 'Min 1 fixture'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const openAdd = () => {
    setDraft(emptyFixture())
    setEditingId(null)
    setErrors({})
    setShowForm(true)
  }

  const openEdit = (f: LightingFixture) => {
    setDraft({ ...f })
    setEditingId(f.id)
    setErrors({})
    setShowForm(true)
  }

  const saveFixture = () => {
    if (!validateDraft()) return
    const fixture: LightingFixture = {
      id: draft.id ?? generateId(),
      area: draft.area!.trim(),
      fixtureType: draft.fixtureType as FixtureTypeName,
      mountingType: needsMounting ? (draft.mountingType as MountingType) : 'N/A',
      lampCount: Number(draft.lampCount),
      wattage: Number(draft.wattage),
      voltage: Number(draft.voltage),
      totalFixture: Number(draft.totalFixture),
    }
    if (editingId) {
      setFixtures(prev => prev.map(f => f.id === editingId ? fixture : f))
    } else {
      setFixtures(prev => [...prev, fixture])
    }
    setShowForm(false)
  }

  const deleteFixture = (fid: string) => {
    setFixtures(prev => prev.filter(f => f.id !== fid))
    setDeleteId(null)
  }

  const handleSave = () => {
    updateProject(id, {
      lightingFixtures: fixtures,
      status: fixtures.length > 0 && project.status === 'Draft' ? 'In Progress' : project.status,
    })
    router.push(`/sales/projects/${id}`)
  }

  const totalWatts = calcTotalWatts(fixtures)
  const totalUnits = fixtures.reduce((s, f) => s + f.totalFixture, 0)

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href={`/sales/projects/${id}`} className="text-slate-500 hover:text-slate-700 text-xl">‹</Link>
          <div>
            <h1 className="font-bold text-slate-900">Lighting Audit</h1>
            <p className="text-slate-400 text-xs">{project.company.name} · {project.facility.name}</p>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      {fixtures.length > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3 flex gap-4">
          <div className="text-center">
            <div className="text-sm font-bold text-emerald-800">{fixtures.length}</div>
            <div className="text-[10px] text-emerald-600">Types</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-emerald-800">{totalUnits}</div>
            <div className="text-[10px] text-emerald-600">Total Units</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-emerald-800">{formatWatts(totalWatts)}</div>
            <div className="text-[10px] text-emerald-600">Total Power</div>
          </div>
        </div>
      )}

      {/* Fixture list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <button
          onClick={openAdd}
          className="w-full py-3.5 border-2 border-dashed border-emerald-400 rounded-2xl text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span> Add Fixture Type
        </button>

        {fixtures.length === 0 && (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">💡</div>
            <p className="text-slate-500 text-sm">No fixtures added yet</p>
            <p className="text-slate-400 text-xs mt-1">Tap above to add each fixture type in this facility</p>
          </div>
        )}

        {fixtures.map(f => {
          const power = f.wattage * f.lampCount * f.totalFixture
          return (
            <div key={f.id} className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="font-semibold text-slate-900">{f.fixtureType}</p>
                  <p className="text-emerald-600 text-xs font-medium">{f.area}</p>
                  {f.mountingType !== 'N/A' && (
                    <p className="text-slate-400 text-xs">{f.mountingType}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {formatWatts(power)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                {[
                  { label: 'Lamps', value: f.lampCount },
                  { label: 'Watts', value: `${f.wattage}W` },
                  { label: 'Volts', value: `${f.voltage}V` },
                  { label: 'Units', value: f.totalFixture },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl py-2">
                    <div className="text-xs font-bold text-slate-800">{item.value}</div>
                    <div className="text-[10px] text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => openEdit(f)}
                  className="flex-1 py-2 border border-gray-200 rounded-xl text-slate-600 text-sm hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(f.id)}
                  className="py-2 px-4 border border-red-200 rounded-xl text-red-500 text-sm hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 p-4 z-40">
        <button
          onClick={handleSave}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-semibold text-base hover:bg-emerald-700 transition-colors"
        >
          Save Audit ({fixtures.length} fixture{fixtures.length !== 1 ? 's' : ''})
        </button>
      </div>

      {/* Add/Edit Fixture Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-[430px] max-h-[90vh] flex flex-col">
            <div className="px-5 pt-5 pb-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Fixture' : 'Add Fixture'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 text-2xl leading-none">×</button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {/* Area */}
              <FormField label="Area *" error={errors.area}>
                <input
                  type="text"
                  value={draft.area ?? ''}
                  onChange={e => setDraft(d => ({ ...d, area: e.target.value }))}
                  placeholder="e.g. Warehouse Floor, Office, Parking"
                  className={iClass(!!errors.area)}
                />
              </FormField>

              {/* Fixture Type */}
              <FormField label="Fixture Type">
                <select
                  value={draft.fixtureType}
                  onChange={e => setDraft(d => ({
                    ...d,
                    fixtureType: e.target.value as FixtureTypeName,
                    mountingType: MOUNTING_APPLICABLE_FIXTURES.includes(e.target.value as FixtureTypeName) ? 'Recessed' : 'N/A',
                  }))}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-base bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {FIXTURE_TYPES.map(ft => (
                    <option key={ft} value={ft}>{ft}</option>
                  ))}
                </select>
              </FormField>

              {/* Mounting type */}
              {needsMounting && (
                <FormField label="Mounting Type">
                  <div className="grid grid-cols-3 gap-2">
                    {MOUNTING_TYPES.map(mt => (
                      <button
                        key={mt}
                        onClick={() => setDraft(d => ({ ...d, mountingType: mt }))}
                        className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          draft.mountingType === mt
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-gray-200'
                        }`}
                      >
                        {mt}
                      </button>
                    ))}
                  </div>
                </FormField>
              )}

              {/* Number row */}
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Lamp Count *" error={errors.lampCount}>
                  <input
                    type="number" min="1"
                    value={draft.lampCount ?? ''}
                    onChange={e => setDraft(d => ({ ...d, lampCount: Number(e.target.value) }))}
                    className={iClass(!!errors.lampCount)}
                  />
                </FormField>
                <FormField label="Wattage (W) *" error={errors.wattage}>
                  <input
                    type="number" min="1"
                    value={draft.wattage ?? ''}
                    onChange={e => setDraft(d => ({ ...d, wattage: Number(e.target.value) }))}
                    className={iClass(!!errors.wattage)}
                  />
                </FormField>
              </div>

              {/* Voltage */}
              <FormField label="Voltage (V) *" error={errors.voltage}>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {COMMON_VOLTAGES.map(v => (
                    <button
                      key={v}
                      onClick={() => setDraft(d => ({ ...d, voltage: v }))}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        draft.voltage === v
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-gray-200'
                      }`}
                    >
                      {v}V
                    </button>
                  ))}
                </div>
                <input
                  type="number" min="1"
                  value={draft.voltage ?? ''}
                  onChange={e => setDraft(d => ({ ...d, voltage: Number(e.target.value) }))}
                  placeholder="Custom voltage"
                  className={iClass(!!errors.voltage)}
                />
              </FormField>

              {/* Total fixtures */}
              <FormField label="Total Fixtures (units) *" error={errors.totalFixture}>
                <input
                  type="number" min="1"
                  value={draft.totalFixture ?? ''}
                  onChange={e => setDraft(d => ({ ...d, totalFixture: Number(e.target.value) }))}
                  className={iClass(!!errors.totalFixture)}
                />
              </FormField>

              {/* Live power calc */}
              {draft.lampCount && draft.wattage && draft.totalFixture && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <p className="text-amber-700 text-sm">
                    Total power: <strong>{formatWatts(Number(draft.lampCount) * Number(draft.wattage) * Number(draft.totalFixture))}</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3.5 border border-gray-300 rounded-2xl text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={saveFixture}
                className="flex-1 py-3.5 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-colors"
              >
                {editingId ? 'Update' : 'Add Fixture'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-[430px] p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Fixture?</h3>
            <p className="text-slate-500 text-sm mb-6">This will remove the fixture from the audit.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3.5 border border-gray-300 rounded-2xl text-slate-700 font-semibold">Cancel</button>
              <button onClick={() => deleteFixture(deleteId)} className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-semibold hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function iClass(hasError: boolean) {
  return `w-full px-4 py-3.5 rounded-xl border text-base transition-all outline-none focus:ring-2 focus:ring-emerald-500 ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
  }`
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
