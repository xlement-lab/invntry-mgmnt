'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApp } from '@/contexts/AppContext'
import { Contact, Salutation } from '@/lib/types'
import { generateId } from '@/lib/utils'

const SALUTATIONS: Salutation[] = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Prof.']

const STEPS = ['Company', 'Contacts', 'Facility', 'Review']

function emptyContact(): Contact {
  return { id: generateId(), salutation: 'Mr.', fullName: '', phone: '', address: '', designation: '' }
}

export default function NewProjectPage() {
  const { currentUser, createProject } = useApp()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Step 1 - Company
  const [companyName, setCompanyName] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')

  // Step 2 - Contacts
  const [contacts, setContacts] = useState<Contact[]>([emptyContact()])

  // Step 3 - Facility
  const [facilityName, setFacilityName] = useState('')
  const [electricityAcct, setElectricityAcct] = useState('')

  const validateStep = (): boolean => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (!companyName.trim()) e.companyName = 'Company name is required'
      if (!companyEmail.trim()) e.companyEmail = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(companyEmail)) e.companyEmail = 'Enter a valid email'
    }
    if (step === 1) {
      contacts.forEach((c, i) => {
        if (!c.fullName.trim()) e[`contact_${i}_name`] = 'Full name is required'
        if (!c.phone.trim()) e[`contact_${i}_phone`] = 'Phone is required'
        if (!c.designation.trim()) e[`contact_${i}_designation`] = 'Designation is required'
      })
    }
    if (step === 2) {
      if (!facilityName.trim()) e.facilityName = 'Facility name is required'
      if (!electricityAcct.trim()) e.electricityAcct = 'Electricity account # is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (validateStep()) setStep(s => s + 1)
  }

  const updateContact = (idx: number, field: keyof Contact, value: string) => {
    setContacts(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c))
  }

  const handleSubmit = () => {
    const now = new Date().toISOString()
    const projectId = generateId()
    createProject({
      id: projectId,
      company: { id: generateId(), name: companyName.trim(), email: companyEmail.trim() },
      contacts,
      facility: { id: generateId(), name: facilityName.trim(), electricityAccountNumber: electricityAcct.trim() },
      lightingFixtures: [],
      status: 'Draft',
      salesNotes: '',
      managementNotes: '',
      followUpNotes: '',
      assignedSalesId: currentUser!.id,
      reviewComments: '',
      documents: [],
      createdAt: now,
      updatedAt: now,
    })
    router.push(`/sales/projects/${projectId}`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/sales/dashboard" className="text-slate-500 hover:text-slate-700 text-xl">‹</Link>
          <h1 className="text-lg font-bold text-slate-900">New Project</h1>
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full transition-all ${i <= step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
              <span className={`text-[10px] ${i === step ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">

        {/* Step 0: Company */}
        {step === 0 && (
          <>
            <div className="text-center mb-2">
              <div className="text-4xl mb-2">🏢</div>
              <h2 className="text-xl font-bold text-slate-900">Company Details</h2>
              <p className="text-slate-500 text-sm mt-1">Enter the company information</p>
            </div>
            <Field label="Company Name *" error={errors.companyName}>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Maple Grove Foods Inc."
                className={inputClass(!!errors.companyName)}
              />
            </Field>
            <Field label="Company Email *" error={errors.companyEmail}>
              <input
                type="email"
                value={companyEmail}
                onChange={e => setCompanyEmail(e.target.value)}
                placeholder="contact@company.com"
                className={inputClass(!!errors.companyEmail)}
              />
            </Field>
          </>
        )}

        {/* Step 1: Contacts */}
        {step === 1 && (
          <>
            <div className="text-center mb-2">
              <div className="text-4xl mb-2">👥</div>
              <h2 className="text-xl font-bold text-slate-900">Contact Persons</h2>
              <p className="text-slate-500 text-sm mt-1">Add 1–2 key contacts</p>
            </div>
            {contacts.map((contact, idx) => (
              <div key={contact.id} className="bg-gray-50 rounded-2xl p-4 space-y-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Contact {idx + 1}</span>
                  {idx === 1 && (
                    <button
                      onClick={() => setContacts([contacts[0]])}
                      className="text-red-400 text-xs hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <Field label="Salutation">
                  <div className="grid grid-cols-5 gap-1.5">
                    {SALUTATIONS.map(sal => (
                      <button
                        key={sal}
                        onClick={() => updateContact(idx, 'salutation', sal)}
                        className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                          contact.salutation === sal
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-600 border-gray-200'
                        }`}
                      >
                        {sal}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Full Name *" error={errors[`contact_${idx}_name`]}>
                  <input
                    type="text"
                    value={contact.fullName}
                    onChange={e => updateContact(idx, 'fullName', e.target.value)}
                    placeholder="John Smith"
                    className={inputClass(!!errors[`contact_${idx}_name`])}
                  />
                </Field>
                <Field label="Phone *" error={errors[`contact_${idx}_phone`]}>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={e => updateContact(idx, 'phone', e.target.value)}
                    placeholder="416-555-0100"
                    className={inputClass(!!errors[`contact_${idx}_phone`])}
                  />
                </Field>
                <Field label="Address">
                  <input
                    type="text"
                    value={contact.address}
                    onChange={e => updateContact(idx, 'address', e.target.value)}
                    placeholder="123 Street, City, Province"
                    className={inputClass(false)}
                  />
                </Field>
                <Field label="Designation *" error={errors[`contact_${idx}_designation`]}>
                  <input
                    type="text"
                    value={contact.designation}
                    onChange={e => updateContact(idx, 'designation', e.target.value)}
                    placeholder="Facility Manager"
                    className={inputClass(!!errors[`contact_${idx}_designation`])}
                  />
                </Field>
              </div>
            ))}
            {contacts.length < 2 && (
              <button
                onClick={() => setContacts(prev => [...prev, emptyContact()])}
                className="w-full py-3 border-2 border-dashed border-emerald-300 rounded-2xl text-emerald-600 text-sm font-medium hover:bg-emerald-50 transition-colors"
              >
                + Add Second Contact
              </button>
            )}
          </>
        )}

        {/* Step 2: Facility */}
        {step === 2 && (
          <>
            <div className="text-center mb-2">
              <div className="text-4xl mb-2">🏭</div>
              <h2 className="text-xl font-bold text-slate-900">Facility Details</h2>
              <p className="text-slate-500 text-sm mt-1">Enter facility information</p>
            </div>
            <Field label="Facility Name *" error={errors.facilityName}>
              <input
                type="text"
                value={facilityName}
                onChange={e => setFacilityName(e.target.value)}
                placeholder="e.g. Main Warehouse"
                className={inputClass(!!errors.facilityName)}
              />
            </Field>
            <Field label="Electricity Account Number *" error={errors.electricityAcct}>
              <input
                type="text"
                value={electricityAcct}
                onChange={e => setElectricityAcct(e.target.value)}
                placeholder="e.g. ACC-ON-2024-001"
                className={inputClass(!!errors.electricityAcct)}
              />
            </Field>
          </>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <>
            <div className="text-center mb-2">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-xl font-bold text-slate-900">Review & Create</h2>
              <p className="text-slate-500 text-sm mt-1">Confirm details before creating</p>
            </div>
            <div className="space-y-3">
              <ReviewCard title="Company" icon="🏢">
                <ReviewRow label="Name" value={companyName} />
                <ReviewRow label="Email" value={companyEmail} />
              </ReviewCard>
              <ReviewCard title="Contacts" icon="👥">
                {contacts.map((c, i) => (
                  <div key={c.id}>
                    {i > 0 && <div className="border-t border-gray-100 my-2" />}
                    <ReviewRow label={`Contact ${i + 1}`} value={`${c.salutation} ${c.fullName}`} />
                    <ReviewRow label="Phone" value={c.phone} />
                    <ReviewRow label="Role" value={c.designation} />
                  </div>
                ))}
              </ReviewCard>
              <ReviewCard title="Facility" icon="🏭">
                <ReviewRow label="Name" value={facilityName} />
                <ReviewRow label="Acct #" value={electricityAcct} />
              </ReviewCard>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <p className="text-emerald-700 text-sm font-medium">Project will be created as <strong>Draft</strong></p>
                <p className="text-emerald-600 text-xs mt-1">You can add lighting fixtures next</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex-1 py-4 border border-gray-300 rounded-2xl text-slate-700 font-semibold text-base hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={next}
            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-semibold text-base hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-sm"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-semibold text-base hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Create Project
          </button>
        )}
      </div>
    </div>
  )
}

function inputClass(hasError: boolean) {
  return `w-full px-4 py-3.5 rounded-xl border text-base transition-all outline-none focus:ring-2 focus:ring-emerald-500 ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white focus:border-emerald-400'
  }`
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}

function ReviewCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span>{icon}</span>
        <span className="font-semibold text-slate-800">{title}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-slate-400 min-w-16">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  )
}
