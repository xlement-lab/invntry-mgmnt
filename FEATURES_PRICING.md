# LightAudit Pro — Feature List & Development Pricing

> Lighting Audit & Sales Workflow Web Application
> Prepared: May 2026 | Currency: Indian Rupees (INR)
> Stack: React + Express.js + Prisma ORM + PostgreSQL

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), TypeScript, Tailwind CSS, React Router v6 |
| State / Data Fetching | TanStack Query (React Query) + Axios |
| Backend | Node.js + Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | JWT (Access + Refresh tokens) + bcrypt |
| File Storage | AWS S3 / Cloudflare R2 (or Multer + local for dev) |
| Deployment | Frontend → Vercel · Backend → Railway / Render |

---

## Feature Completion Status (Current Demo vs Production)

| Module | Demo Status | Production Status |
|---|---|---|
| UI — Sales Mobile | ✅ Complete | ✅ Reusable as-is |
| UI — Admin Desktop | ✅ Complete | ✅ Reusable as-is |
| Multi-step project form | ✅ Complete | ⚠️ Needs API wiring |
| Lighting audit entry | ✅ Complete | ⚠️ Needs API wiring |
| Role-based UI guards | ✅ Complete | ⚠️ Needs real token check |
| Authentication | ❌ Mock only | ❌ Needs full implementation |
| Data persistence | ❌ localStorage | ❌ Needs Prisma + PostgreSQL |
| File uploads | ❌ Simulated | ❌ Needs S3 / Multer |
| Backend REST API | ❌ None | ❌ Needs full implementation |
| Email notifications | ❌ None | ❌ Optional — add-on |

---

## Module Breakdown & Pricing

---

### 1. Authentication & User Management
> **Demo:** Mock login · **Production:** Full JWT auth required

| Feature | Description | Est. Hours | Rate (₹/hr) | Cost (₹) |
|---|---|---|---|---|
| User registration (Admin only) | Admin creates sales user accounts | 5 | 1,500 | 7,500 |
| Login endpoint (Express) | POST /auth/login — bcrypt verify, issue JWT | 5 | 1,500 | 7,500 |
| JWT access + refresh tokens | Short-lived access token + refresh rotation | 7 | 1,500 | 10,500 |
| Auth middleware (Express) | Protect all routes, decode token, attach user | 5 | 1,500 | 7,500 |
| Role guard middleware | Sales / Admin / Super Admin permission checks | 5 | 1,500 | 7,500 |
| Logout & token invalidation | Blacklist or refresh token deletion | 3 | 1,500 | 4,500 |
| Password change | Authenticated user can update password | 4 | 1,500 | 6,000 |
| Frontend auth context | Token storage, auto-refresh, login/logout flow | 6 | 1,500 | 9,000 |
| Protected route wrapper (React) | Redirect to login if unauthenticated | 3 | 1,500 | 4,500 |
| **Subtotal** | | **43 hrs** | | **₹ 64,500** |

---

### 2. Database Schema & Prisma Setup
> **Demo:** None · **Production:** Full schema required

| Feature | Description | Est. Hours | Rate (₹/hr) | Cost (₹) |
|---|---|---|---|---|
| Prisma init + PostgreSQL connection | schema.prisma, .env, DATABASE_URL | 3 | 1,500 | 4,500 |
| User model | id, name, email, passwordHash, role, createdAt | 2 | 1,500 | 3,000 |
| Company model | id, name, email, createdAt | 2 | 1,500 | 3,000 |
| Contact model | id, companyId, salutation, fullName, phone, address, designation | 3 | 1,500 | 4,500 |
| Facility model | id, companyId, name, electricityAccountNumber | 2 | 1,500 | 3,000 |
| Project model | id, companyId, facilityId, assignedUserId, status, notes fields, subsidy fields | 5 | 1,500 | 7,500 |
| LightingFixture model | id, projectId, area, fixtureType, mountingType, lampCount, wattage, voltage, totalFixture | 4 | 1,500 | 6,000 |
| Document model | id, projectId, name, type, url, size, uploadedBy, uploadedAt | 3 | 1,500 | 4,500 |
| Prisma migrations | Initial migration + all subsequent schema changes | 4 | 1,500 | 6,000 |
| Database seeding script | Seed realistic demo data via prisma/seed.ts | 4 | 1,500 | 6,000 |
| Prisma client helper | Singleton client export for Express use | 2 | 1,500 | 3,000 |
| **Subtotal** | | **34 hrs** | | **₹ 51,000** |

---

### 3. Backend REST API — Express.js
> **Demo:** None · **Production:** Full API required

| Feature | Description | Est. Hours | Rate (₹/hr) | Cost (₹) |
|---|---|---|---|---|
| Express project setup | TypeScript, cors, helmet, dotenv, error handler | 5 | 1,500 | 7,500 |
| Input validation middleware | Zod schemas for all request bodies | 6 | 1,500 | 9,000 |
| **Projects API** | | | | |
| GET /projects | List all (admin) or own (sales) with filters | 5 | 1,500 | 7,500 |
| POST /projects | Create project (Draft) | 4 | 1,500 | 6,000 |
| GET /projects/:id | Single project with all relations | 4 | 1,500 | 6,000 |
| PATCH /projects/:id | Update project fields | 4 | 1,500 | 6,000 |
| PATCH /projects/:id/status | Status transitions with business logic enforcement | 6 | 1,500 | 9,000 |
| **Contacts API** | | | | |
| POST /projects/:id/contacts | Add contact (max 2 check) | 3 | 1,500 | 4,500 |
| PUT /projects/:id/contacts/:cid | Update contact | 3 | 1,500 | 4,500 |
| DELETE /projects/:id/contacts/:cid | Remove contact | 2 | 1,500 | 3,000 |
| **Fixtures API** | | | | |
| GET /projects/:id/fixtures | List all fixtures for a project | 2 | 1,500 | 3,000 |
| POST /projects/:id/fixtures | Add fixture | 3 | 1,500 | 4,500 |
| PUT /projects/:id/fixtures/:fid | Update fixture | 3 | 1,500 | 4,500 |
| DELETE /projects/:id/fixtures/:fid | Delete fixture | 2 | 1,500 | 3,000 |
| **Subsidy API** | | | | |
| PATCH /projects/:id/subsidy | Admin-only update subsidy fields | 4 | 1,500 | 6,000 |
| **Users API** | | | | |
| GET /users | Super admin — list all users | 3 | 1,500 | 4,500 |
| POST /users | Super admin — create user | 4 | 1,500 | 6,000 |
| PATCH /users/:id | Update user role / info | 3 | 1,500 | 4,500 |
| **Subtotal** | | **66 hrs** | | **₹ 99,000** |

---

### 4. File Upload & Storage
> **Demo:** Simulated · **Production:** Real upload required

| Feature | Description | Est. Hours | Rate (₹/hr) | Cost (₹) |
|---|---|---|---|---|
| Multer middleware setup | File size limits, type whitelist (pdf, jpg, png, zip) | 4 | 1,500 | 6,000 |
| AWS S3 / R2 integration | SDK setup, bucket config, upload helper | 6 | 1,500 | 9,000 |
| POST /projects/:id/documents | Upload file, save Document record to DB | 5 | 1,500 | 7,500 |
| DELETE /projects/:id/documents/:did | Delete doc from S3 + DB | 3 | 1,500 | 4,500 |
| Presigned URL generation | Secure time-limited download links | 4 | 1,500 | 6,000 |
| Frontend upload component | File picker, progress indicator, file list | 6 | 1,500 | 9,000 |
| **Subtotal** | | **28 hrs** | | **₹ 42,000** |

---

### 5. Frontend — API Integration (React Query + Axios)
> **Demo:** localStorage · **Production:** All screens need API wiring

| Feature | Description | Est. Hours | Rate (₹/hr) | Cost (₹) |
|---|---|---|---|---|
| Axios instance + interceptors | Base URL, auth header injection, 401 redirect | 4 | 1,500 | 6,000 |
| React Query setup | QueryClient, DevTools, global error handling | 3 | 1,500 | 4,500 |
| Projects list query | useQuery for dashboard + admin list with filters | 5 | 1,500 | 7,500 |
| Project detail query | useQuery with relations (contacts, fixtures, docs) | 4 | 1,500 | 6,000 |
| Create project mutation | useMutation + optimistic cache update | 4 | 1,500 | 6,000 |
| Update project mutation | Status changes, notes save, subsidy update | 5 | 1,500 | 7,500 |
| Fixtures mutations | Add / edit / delete with cache invalidation | 5 | 1,500 | 7,500 |
| Loading & error states | Skeleton loaders, toast error messages | 5 | 1,500 | 7,500 |
| **Subtotal** | | **35 hrs** | | **₹ 52,500** |

---

### 6. Sales Executive — Mobile UI
> **Demo:** ✅ Complete · **Production:** Minor wiring updates only

| Feature | Description | Est. Hours | Rate (₹/hr) | Cost (₹) |
|---|---|---|---|---|
| Mobile shell layout | Max 430px centered shell | 5 | 1,500 | 7,500 |
| Bottom navigation bar | Projects / New / Profile tabs | 4 | 1,500 | 6,000 |
| Dashboard with stats | KPI cards from API data | 6 | 1,500 | 9,000 |
| Search & filter chips | Real-time filter using query params | 5 | 1,500 | 7,500 |
| Project cards list | Card layout with rework banners | 6 | 1,500 | 9,000 |
| Profile & sign out page | User info, pipeline counts, logout | 3 | 1,500 | 4,500 |
| **Subtotal** | | **29 hrs** | | **₹ 43,500** |

---

### 7. Multi-Step Project Creation Form
> **Demo:** ✅ Complete · **Production:** API wiring required

| Feature | Description | Est. Hours | Rate (₹/hr) | Cost (₹) |
|---|---|---|---|---|
| Step 1 — Company Details | Name, Email with validation | 4 | 1,500 | 6,000 |
| Step 2 — Contact Persons | Salutation toggle, up to 2 contacts | 8 | 1,500 | 12,000 |
| Step 3 — Facility Details | Facility name, electricity account # | 3 | 1,500 | 4,500 |
| Step 4 — Review & Submit | Summary + POST /projects API call | 4 | 1,500 | 6,000 |
| Progress bar & step navigation | Visual stepper with back/continue | 4 | 1,500 | 6,000 |
| Form validation (per step) | Zod-based client-side validation | 4 | 1,500 | 6,000 |
| **Subtotal** | | **27 hrs** | | **₹ 40,500** |

---

### 8. Project Detail — Sales View
> **Demo:** ✅ Complete · **Production:** API wiring required

| Feature | Description | Est. Hours | Rate (₹/hr) | Cost (₹) |
|---|---|---|---|---|
| Tabbed project layout | Overview / Fixtures / Notes / Docs tabs | 5 | 1,500 | 7,500 |
| Overview tab | Company, contacts, facility, subsidy read-only | 6 | 1,500 | 9,000 |
| Notes tab | Sales notes + follow-up notes save | 4 | 1,500 | 6,000 |
| Documents tab | Doc list with presigned download URLs | 4 | 1,500 | 6,000 |
| Status-aware action buttons | Start / Submit / Resubmit logic | 6 | 1,500 | 9,000 |
| Submit confirmation modal | Lock warning bottom sheet | 3 | 1,500 | 4,500 |
| Rework alert banner | Shows admin review comments | 2 | 1,500 | 3,000 |
| **Subtotal** | | **30 hrs** | | **₹ 45,000** |

---

### 9. Lighting Audit — Field Data Entry
> **Demo:** ✅ Complete · **Production:** API wiring required

| Feature | Description | Est. Hours | Rate (₹/hr) | Cost (₹) |
|---|---|---|---|---|
| Fixture list with summary bar | Total types, units, power from API | 5 | 1,500 | 7,500 |
| Add/Edit fixture modal | Slide-up modal, all SRS fields | 10 | 1,500 | 15,000 |
| 18 fixture types dropdown | All SRS types + Potlights sizes | 3 | 1,500 | 4,500 |
| Mounting type selector | Conditional toggle buttons | 3 | 1,500 | 4,500 |
| Voltage quick-select | Preset + custom input | 3 | 1,500 | 4,500 |
| Live power calculation | Real-time watts display | 3 | 1,500 | 4,500 |
| Delete confirmation modal | Safe delete flow | 2 | 1,500 | 3,000 |
| Auto status promotion | Draft → In Progress on first save | 2 | 1,500 | 3,000 |
| **Subtotal** | | **31 hrs** | | **₹ 46,500** |

---

### 10. Admin Manager — Desktop Dashboard
> **Demo:** ✅ Complete · **Production:** API wiring required

| Feature | Description | Est. Hours | Rate (₹/hr) | Cost (₹) |
|---|---|---|---|---|
| Sidebar navigation | Fixed sidebar, responsive hamburger | 10 | 1,500 | 15,000 |
| KPI stat cards | Live counts from API | 5 | 1,500 | 7,500 |
| Awaiting review list | Submitted projects from API | 4 | 1,500 | 6,000 |
| Recent activity feed | Latest updated projects | 3 | 1,500 | 4,500 |
| Sales team overview | Per-rep counts from API | 4 | 1,500 | 6,000 |
| Portfolio metrics | Totals computed from API data | 3 | 1,500 | 4,500 |
| **Subtotal** | | **29 hrs** | | **₹ 43,500** |

---

### 11. Admin — Projects List & Filters
> **Demo:** ✅ Complete · **Production:** Server-side filtering required

| Feature | Description | Est. Hours | Rate (₹/hr) | Cost (₹) |
|---|---|---|---|---|
| Sortable data table | Sort by company, status, date | 6 | 1,500 | 9,000 |
| Server-side filtering | Status, sales rep, search via query params | 6 | 1,500 | 9,000 |
| Status chip filters with live counts | Counts from API aggregation | 5 | 1,500 | 7,500 |
| Pagination | Page-based or cursor-based | 6 | 1,500 | 9,000 |
| **Subtotal** | | **23 hrs** | | **₹ 34,500** |

---

### 12. Admin — Project Detail & Review Controls
> **Demo:** ✅ Complete · **Production:** API wiring required

| Feature | Description | Est. Hours | Rate (₹/hr) | Cost (₹) |
|---|---|---|---|---|
| Approve submission (API call) | PATCH status → Validated | 4 | 1,500 | 6,000 |
| Request rework with comments | PATCH status + reviewComments | 5 | 1,500 | 7,500 |
| Audit data table view | Fixture table with totals row | 5 | 1,500 | 7,500 |
| Subsidy fields (admin-only) | PATCH /projects/:id/subsidy | 6 | 1,500 | 9,000 |
| Management notes | Separate patch endpoint | 3 | 1,500 | 4,500 |
| Document upload (real) | Multipart upload to S3 | 5 | 1,500 | 7,500 |
| Document list with signed URLs | Presigned download links | 3 | 1,500 | 4,500 |
| Status progression control | Move to next pipeline stage | 5 | 1,500 | 7,500 |
| **Subtotal** | | **36 hrs** | | **₹ 54,000** |

---

### 13. Super Admin — User Management
> **Demo:** Not built · **Production:** Required for onboarding staff

| Feature | Description | Est. Hours | Rate (₹/hr) | Cost (₹) |
|---|---|---|---|---|
| Users list page | Table of all users with role badges | 5 | 1,500 | 7,500 |
| Create user form | Name, email, role, temp password | 5 | 1,500 | 7,500 |
| Edit user / change role | Update role, deactivate account | 4 | 1,500 | 6,000 |
| Deactivate / reactivate user | Soft delete via isActive flag | 3 | 1,500 | 4,500 |
| **Subtotal** | | **17 hrs** | | **₹ 25,500** |

---

### 14. Environment, DevOps & Deployment
> **Demo:** Minimal · **Production:** Full setup required

| Feature | Description | Est. Hours | Rate (₹/hr) | Cost (₹) |
|---|---|---|---|---|
| Monorepo or separate repos | /client (React) + /server (Express) structure | 3 | 1,500 | 4,500 |
| Environment config | .env files, secrets management | 3 | 1,500 | 4,500 |
| Vercel deploy (frontend) | Build config, env vars | 2 | 1,500 | 3,000 |
| Railway / Render deploy (backend) | Express server + Postgres provisioning | 4 | 1,500 | 6,000 |
| Database migration in production | Prisma migrate deploy in CI | 3 | 1,500 | 4,500 |
| CORS & security headers | Helmet, rate limiting, CORS config | 3 | 1,500 | 4,500 |
| **Subtotal** | | **18 hrs** | | **₹ 27,000** |

---

## Cost Summary

| # | Module | Hours | Cost (₹) | Status |
|---|---|---|---|---|
| 1 | Authentication & User Management | 43 | ₹ 64,500 | ❌ New |
| 2 | Database Schema & Prisma Setup | 34 | ₹ 51,000 | ❌ New |
| 3 | Backend REST API — Express.js | 66 | ₹ 99,000 | ❌ New |
| 4 | File Upload & Storage | 28 | ₹ 42,000 | ❌ New |
| 5 | Frontend — API Integration | 35 | ₹ 52,500 | ❌ New |
| 6 | Sales Executive — Mobile UI | 29 | ₹ 43,500 | ✅ Demo Done |
| 7 | Multi-Step Project Creation Form | 27 | ₹ 40,500 | ✅ Demo Done |
| 8 | Project Detail — Sales View | 30 | ₹ 45,000 | ✅ Demo Done |
| 9 | Lighting Audit — Field Data Entry | 31 | ₹ 46,500 | ✅ Demo Done |
| 10 | Admin — Desktop Dashboard | 29 | ₹ 43,500 | ✅ Demo Done |
| 11 | Admin — Projects List & Filters | 23 | ₹ 34,500 | ✅ Demo Done |
| 12 | Admin — Project Detail & Review | 36 | ₹ 54,000 | ✅ Demo Done |
| 13 | Super Admin — User Management | 17 | ₹ 25,500 | ❌ New |
| 14 | Environment, DevOps & Deployment | 18 | ₹ 27,000 | ❌ New |
| | **TOTAL** | **446 hrs** | **₹ 6,69,000** | |

---

## Work Breakdown: Demo vs New Production Work

| Category | Hours | Cost (₹) |
|---|---|---|
| ✅ Already built (UI/logic in demo) | 205 hrs | ₹ 3,07,500 |
| ❌ New work for production stack | 241 hrs | ₹ 3,61,500 |
| **Grand Total** | **446 hrs** | **₹ 6,69,000** |

---

## Optional Add-on Modules

| Module | Description | Est. Cost (₹) |
|---|---|---|
| Email Notifications | Status change alerts via Resend / Nodemailer | ₹ 20,000 – 30,000 |
| PDF Quote Generator | Auto-generate quotation PDFs (react-pdf / puppeteer) | ₹ 35,000 – 50,000 |
| Mobile App (React Native / Expo) | Convert Sales UI to native iOS/Android app | ₹ 1,50,000 – 2,50,000 |
| Reporting & Analytics | Charts, Excel/CSV export, date-range filters | ₹ 40,000 – 60,000 |
| Multi-facility per Company | One company → multiple facilities | ₹ 20,000 – 30,000 |
| Lead Assignment by Admin | Admin assigns projects to specific sales reps | ₹ 15,000 – 20,000 |
| Activity / Audit Log | Track who changed what and when | ₹ 20,000 – 30,000 |

---

## Pricing Notes

- **Hourly rate used:** ₹ 1,500 / hr (mid-senior full-stack developer)
- **Timeline estimate:** 10–14 weeks solo · 5–7 weeks with 2-person team
- **Hosting (production):**
  - Frontend on Vercel — ₹ 0 (Hobby) or ₹ ~1,700/month (Pro)
  - Backend on Railway — ₹ ~500–1,500/month
  - PostgreSQL on Railway / Supabase — ₹ 0 (free tier) or ₹ ~800–2,000/month
  - S3 file storage — ₹ ~200–500/month depending on usage
- **Total est. monthly hosting:** ₹ 1,500 – 5,700/month
- **Domain:** ₹ 800 – 1,200/year

---

## Prisma Schema Overview (Reference)

```prisma
model User {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  passwordHash String
  role         Role      @default(SALES)
  isActive     Boolean   @default(true)
  projects     Project[]
  createdAt    DateTime  @default(now())
}

model Company {
  id        String     @id @default(cuid())
  name      String
  email     String
  contacts  Contact[]
  projects  Project[]
  createdAt DateTime   @default(now())
}

model Contact {
  id          String  @id @default(cuid())
  company     Company @relation(fields: [companyId], references: [id])
  companyId   String
  salutation  String
  fullName    String
  phone       String
  address     String?
  designation String
}

model Facility {
  id                     String    @id @default(cuid())
  name                   String
  electricityAccountNumber String
  projects               Project[]
}

model Project {
  id                   String           @id @default(cuid())
  company              Company          @relation(fields: [companyId], references: [id])
  companyId            String
  facility             Facility         @relation(fields: [facilityId], references: [id])
  facilityId           String
  assignedUser         User             @relation(fields: [assignedUserId], references: [id])
  assignedUserId       String
  status               ProjectStatus    @default(DRAFT)
  salesNotes           String           @default("")
  managementNotes      String           @default("")
  followUpNotes        String           @default("")
  reviewComments       String           @default("")
  subsidyAmount        Float?
  subsidyProposalNumber String?
  subsidyPspxNumber    String?
  lightingFixtures     LightingFixture[]
  documents            Document[]
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt
}

model LightingFixture {
  id           String  @id @default(cuid())
  project      Project @relation(fields: [projectId], references: [id])
  projectId    String
  area         String
  fixtureType  String
  mountingType String
  lampCount    Int
  wattage      Float
  voltage      Float
  totalFixture Int
}

model Document {
  id         String   @id @default(cuid())
  project    Project  @relation(fields: [projectId], references: [id])
  projectId  String
  name       String
  type       String
  url        String
  size       String
  uploadedBy String
  uploadedAt DateTime @default(now())
}

enum Role {
  SALES
  ADMIN
  SUPER_ADMIN
}

enum ProjectStatus {
  DRAFT
  IN_PROGRESS
  SUBMITTED
  VALIDATED
  REWORK_REQUIRED
  QUOTATION_GENERATED
  PROPOSAL_SENT
  NEGOTIATION
  CLOSED_WON
  CLOSED_LOST
}
```

---

*Document version 2.0 — LightAudit Pro · Stack: React + Express + Prisma + PostgreSQL*
