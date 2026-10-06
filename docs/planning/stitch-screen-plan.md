# EduSphere — Stitch UI Exploration & Screen Generation Plan

**Role:** STITCH — Design and Prototyping Specialist  
**Design Intelligence Source:** UI/UX Pro Max (`Plus Jakarta Sans`, Cobalt Trust Palette)  
**Target Viewports:** Mobile (375px), Tablet (768px), Desktop (1440px)  
**States Required per Screen:** `Loading`, `Empty`, `Error`, `Success`, `Disabled`

---

## 1. Overview & Strategy

Stitch is utilized as the visual source of truth for exploring screen hierarchies, layout balance, visual rhythm, and interaction flows before translating them into production-ready Material UI (MUI v6) and React 18 components.

---

## 2. Screen Inventory & State Specifications

### Group A: Public Surfaces

| Screen ID | Screen Name | Key Components | Required States Handled | Responsive Behaviors |
|:---|:---|:---|:---|:---|
| `PUB-01` | **Marketing Landing Page** | Hero section with dynamic CTA, multi-tenant value proposition, feature breakdown cards, institutional testimonials, enterprise footer. | Default, Hover animations | Hero transitions to single-column stacked layout on mobile; sticky header collapses into hamburger drawer. |
| `PUB-02` | **Tenant-Aware Login** | Institution selector / auto-detected subdomain banner, email/password fields, OAuth Google button, "Remember me", forgot password link. | Loading (spinner on submit), Error (invalid credentials alert), Disabled (submitting). | Centered card on desktop with subtle glassmorphic backdrop; full-bleed card on mobile. |
| `PUB-03` | **Student Registration** | Multi-step form: Personal info, institutional student ID, password strength indicator, Terms acceptance. | Loading, Form Validation Errors (inline Zod feedback), Success (verification sent). | Single column stepper; mobile friendly inputs with `minHeight: 44px`. |
| `PUB-04` | **Forgot / Reset Password** | Email input, reset code entry, new password confirmation. | Loading, Success toast, Invalid/expired token alert. | Compact card view with explicit feedback states. |
| `PUB-05` | **OAuth Callback Interstitial** | Animated loading spinner, status text ("Authenticating with Google..."), error fallback button. | Loading skeleton, Auth failure redirect state. | Centered spinner with progress indicator. |

---

### Group B: Super Admin Management

| Screen ID | Screen Name | Key Components | Required States Handled | Responsive Behaviors |
|:---|:---|:---|:---:|:---|
| `ADM-01` | **Super Admin Dashboard** | Platform KPI metric cards (Total Tenants, Active Users, Storage Used), tenant growth bar chart, audit log feed. | Skeleton loading, Empty (no recent alerts), Error boundary. | 4-column KPI cards on desktop; 2-column on tablet; 1-column on mobile. |
| `ADM-02` | **Tenant Directory** | Search bar, status filter (Active/Suspended/Trial), data table with pagination, "Create Tenant" drawer trigger. | Skeleton table, Empty search result, Error alert. | Horizontal scroll table with sticky columns on mobile; expandable row details. |
| `ADM-03` | **Tenant Provisioning Modal** | Form: Organization name, subdomain slug (auto-check availability), admin email, subscription limits, branding colors. | Slug checking spinner, Field error, Success redirect. | Multi-tab dialog on desktop; full-screen dialog on mobile. |
| `ADM-04` | **Platform System Telemetry** | Server latency metrics, MongoDB query stats, Redis cache hit/miss ratio, system error rates. | Real-time polling spinner, Zero data state. | Recharts responsive containers wrapping time-series charts. |

---

### Group C: Tenant Admin Management

| Screen ID | Screen Name | Key Components | Required States Handled | Responsive Behaviors |
|:---|:---|:---|:---:|:---|
| `TAD-01` | **Tenant Overview Dashboard** | Active students, instructor count, total published courses, completion rate gauge, recent student signups. | Skeletons, Empty metrics for new tenant. | Responsive grid with card elevation. |
| `TAD-02` | **User Directory & Roster** | Role tabs (All, Instructors, Students), bulk user invite CSV button, user action menu (Edit, Suspend, Change Role). | Skeleton table, Empty tab states, Confirmation dialog. | Sticky action column; search filter bar collapses into drawer on mobile. |
| `TAD-03` | **Course Administration** | Course status badges (Draft, Published, Archived), instructor assignment dropdown, enrollment stats. | Loading, Empty course catalog. | Grid or table switchable view. |
| `TAD-04` | **Tenant Settings & Branding** | Logo upload zone, primary color picker, domain config, self-registration toggle, storage quotas. | Image preview, Save loading, Success toast. | Tabbed settings navigation. |

---

### Group D: Instructor Workstation

| Screen ID | Screen Name | Key Components | Required States Handled | Responsive Behaviors |
|:---|:---|:---|:---:|:---|
| `INS-01` | **Instructor Dashboard** | Active teaching courses, pending assignment submissions badge, recent student queries, quiz score distribution. | Skeleton cards, Empty pending submissions. | Quick action buttons prominently pinned. |
| `INS-02` | **Course Builder & Syllabus** | Drag-and-drop module reordering, add lesson button, curriculum tree view, publish toggle switch. | Saving indicator, Empty module prompt. | Collapsible accordion modules. |
| `INS-03` | **Lesson Editor** | Rich text / Markdown editor, video URL embed preview, downloadable attachment dropzone, duration input. | Auto-save status ("Saved 2m ago"), Upload progress. | Split screen edit/preview on desktop; tabbed on mobile. |
| `INS-04` | **Quiz Authoring Engine** | Question list, question type selector (MCQ, Multi-select, True/False), points weight, explanation helper text. | Validation error (missing correct option), Empty quiz. | Card list with inline question editing. |
| `INS-05` | **Grading Center** | Student submission list, file viewer, grading score input (e.g. 85/100), markdown feedback textarea. | Loading submission, Saved grade toast. | Side-by-side submission review on desktop. |

---

### Group E: Student Learning Portal

| Screen ID | Screen Name | Key Components | Required States Handled | Responsive Behaviors |
|:---|:---|:---|:---:|:---|
| `STU-01` | **Student Dashboard** | "Continue Learning" hero banner, enrolled courses progress cards, upcoming quiz deadlines, unread announcements. | Skeleton cards, Empty state ("No courses enrolled yet"). | Grid of course progress cards with linear progress bars. |
| `STU-02` | **Course Discovery Catalog** | Category filters, search input, level chips, price tags, course cards with thumbnail, rating, and "Enroll Now" CTA. | Search spinner, Empty search results with reset filter. | Responsive 3-column card grid. |
| `STU-03` | **Course Detail & Syllabus** | Course summary, instructor bio, full syllabus outline with locked/unlocked lesson indicators, enrollment button. | Already enrolled state vs Non-enrolled CTA. | Two-column layout: course syllabus left, sticky enroll card right. |
| `STU-04` | **Learning Player** | Video/Content viewport, markdown lesson notes, "Mark Complete & Next" floating button, collapsible curriculum sidebar. | Media loading spinner, Lesson completed checkmark. | Sidebar collapses on mobile; player prioritizes full-width video. |
| `STU-05` | **Interactive Quiz Runner** | Timed banner countdown, question progress bar, option selector cards, "Submit Quiz" confirmation modal. | Timer warning (sub-5 mins), Submitting spinner, Results screen. | Touch-friendly option cards with large hit areas (min 48px). |
| `STU-06` | **Certificates & Transcripts** | Earned certificate showcase, PDF download button, verifiable credential code badge. | Empty certificates illustration. | Certificate card preview modal. |

---

### Group F: Real-Time & Collaboration

| Screen ID | Screen Name | Key Components | Required States Handled | Responsive Behaviors |
|:---|:---|:---|:---:|:---|
| `RT-01` | **Course Live Chat / Room** | Message stream, online user avatar chips, markdown text input, attachment button, auto-scroll toggle. | Connecting state, Reconnecting banner, Empty chat history. | Bottom sticky chat input, virtualized message scroll. |
| `RT-02` | **Notification Center** | Popover / drawer with unread filter, "Mark all as read" button, direct link to course/quiz event. | Empty notification bell, Unread count badge. | Popover on desktop; bottom sheet drawer on mobile. |
