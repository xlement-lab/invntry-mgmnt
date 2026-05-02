---
name: LightAudit Pro App
description: Next.js 14 lighting audit & sales workflow demo app — tech stack, structure, and SRS summary
type: project
---

Full demo web app built per SRS (23 Apr + 02 May 2026).

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, localStorage (no DB).

**Roles:** Sales Executive (mobile-first UI), Admin Manager (desktop dashboard), Super Admin.

**Mock users in lib/mock-data.ts:** Jake (sales/u1), Sarah (sales/u2), Robert (admin/u3), System Admin (super_admin/u4).

**Workflow statuses:** Draft → In Progress → Submitted → Validated|Rework Required → Quotation Generated → Proposal Sent → Negotiation → Closed Won|Closed Lost.

**Key routes:**
- `/login` — user selection (demo)
- `/sales/dashboard` — mobile pipeline view
- `/sales/projects/new` — 4-step form (Company → Contacts → Facility → Review)
- `/sales/projects/[id]` — tabs: overview, fixtures, notes, docs
- `/sales/projects/[id]/audit` — add/edit lighting fixtures modal
- `/admin/dashboard` — KPI cards + awaiting review list
- `/admin/projects` — sortable/filterable table
- `/admin/projects/[id]` — review controls, subsidy editing, doc upload

**Subsidy fields:** Admin-only edit (amount, proposal#, pspx#) but visible read-only to sales.

**State persistence:** localStorage via lib/store.ts + React Context (contexts/AppContext.tsx).

**Vercel deploy:** `npm run build` passes clean — push to GitHub and connect to Vercel.

Why: Client demo for lighting audit sales workflow SRS.
How to apply: When resuming this project, reference routes above and SRS constraints around role permissions.
