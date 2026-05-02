export type UserRole = 'sales' | 'admin' | 'super_admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  initials: string
}

export type Salutation = 'Mr.' | 'Ms.' | 'Mrs.' | 'Dr.' | 'Prof.'

export interface Contact {
  id: string
  salutation: Salutation
  fullName: string
  phone: string
  address: string
  designation: string
}

export interface Company {
  id: string
  name: string
  email: string
}

export interface Facility {
  id: string
  name: string
  electricityAccountNumber: string
}

export type FixtureTypeName =
  | '4x2'
  | '4x1'
  | '2x2'
  | 'Linear 4ft'
  | 'Linear 8ft'
  | 'Metal Halide'
  | 'Canopy'
  | 'Sodium Halide'
  | 'Wallpack'
  | 'Floodlight'
  | 'Troffer Highbay'
  | 'Post Top'
  | 'Potlights 2"'
  | 'Potlights 4"'
  | 'Potlights 6"'
  | 'Potlights 7"'
  | 'Potlights 8"'
  | 'Potlights 12"'

export type MountingType = 'Recessed' | 'Ceiling Mount' | 'Suspended' | 'N/A'

export const FIXTURE_TYPES: FixtureTypeName[] = [
  '4x2', '4x1', '2x2',
  'Linear 4ft', 'Linear 8ft',
  'Metal Halide', 'Canopy', 'Sodium Halide',
  'Wallpack', 'Floodlight', 'Troffer Highbay', 'Post Top',
  'Potlights 2"', 'Potlights 4"', 'Potlights 6"',
  'Potlights 7"', 'Potlights 8"', 'Potlights 12"',
]

export const MOUNTING_APPLICABLE_FIXTURES: FixtureTypeName[] = [
  '4x2', '4x1', '2x2', 'Linear 4ft', 'Linear 8ft',
]

export interface LightingFixture {
  id: string
  area: string
  fixtureType: FixtureTypeName
  mountingType: MountingType
  lampCount: number
  wattage: number
  voltage: number
  totalFixture: number
}

export type ProjectStatus =
  | 'Draft'
  | 'In Progress'
  | 'Submitted'
  | 'Validated'
  | 'Rework Required'
  | 'Quotation Generated'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost'

export interface UploadedDocument {
  id: string
  name: string
  type: 'quotation' | 'proposal' | 'subsidy' | 'site_image' | 'customer_doc'
  url: string
  uploadedAt: string
  uploadedBy: string
  size: string
}

export interface Project {
  id: string
  company: Company
  contacts: Contact[]
  facility: Facility
  lightingFixtures: LightingFixture[]
  status: ProjectStatus
  salesNotes: string
  managementNotes: string
  followUpNotes: string
  subsidyAmount?: number
  subsidyProposalNumber?: string
  subsidyPspxNumber?: string
  assignedSalesId: string
  reviewComments?: string
  documents: UploadedDocument[]
  createdAt: string
  updatedAt: string
}

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Submitted: 'bg-violet-100 text-violet-700',
  Validated: 'bg-emerald-100 text-emerald-700',
  'Rework Required': 'bg-red-100 text-red-700',
  'Quotation Generated': 'bg-teal-100 text-teal-700',
  'Proposal Sent': 'bg-indigo-100 text-indigo-700',
  Negotiation: 'bg-amber-100 text-amber-700',
  'Closed Won': 'bg-green-200 text-green-800',
  'Closed Lost': 'bg-slate-200 text-slate-700',
}
