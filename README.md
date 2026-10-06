# EduSphere — Multi-Tenant Enterprise Learning Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Material UI](https://img.shields.io/badge/Material--UI-v6-blue.svg)](https://mui.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-brightgreen.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.x%2F9.x-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

**Project ID:** PGY2-01  
**Project Title:** Full-Stack Enterprise Web Platform  
**Mapped Courses:**
- **CAP646** — Full Stack Web Development
- **CAP774** — Styling and Scripting for Web Development  
**Academic Target:** CA2 + CA3 Evaluation Exemption Validation  
**Team Size:** 3–4 Students  
**Duration:** 14–16 Weeks  

---

## 1. Executive Summary

**EduSphere** is a production-grade, multi-tenant enterprise Software-as-a-Service (SaaS) Learning Management System. It allows multiple independent educational institutions (universities, colleges, professional academies) to operate on a unified platform with strict logical tenant isolation, dedicated branding, role-based workflows, and real-time interaction capabilities.

### Key Capabilities
- **Strict Multi-Tenancy:** Subdomain / header / JWT tenant resolution with auto-scoped data access and negative isolation guarantees.
- **Enterprise 6-Tier Architecture:** Route → Middleware → Controller → Service → Repository → Database.
- **Robust Security & Auth:** Dual-token JWT (15-min access), cryptographically random refresh token rotation with token family reuse detection in Redis, Argon2id password hashing, and Google OAuth2 integration.
- **Four-Tier RBAC:** Granular authorization covering `SUPER_ADMIN`, `TENANT_ADMIN`, `INSTRUCTOR`, and `STUDENT`.
- **Curriculum & Assessment Engine:** Multi-format lessons (Video, Markdown, Files), auto-grading quizzes with time limits, and assignment submission/grading workflows.
- **Real-Time Collaboration:** Socket.IO WebSocket server for live classroom chat, instant announcements, and notification dispatch.
- **High-Performance Caching:** Redis cache-aside caching on popular course queries, catalog discovery, and dashboard telemetry with automated invalidation triggers.
- **Modern Responsive Frontend:** React 18, Vite, Material UI (MUI v6) with unified design tokens (Plus Jakarta Sans, Cobalt Trust Palette), Redux Toolkit, and TanStack Query.
- **Automated Testing & Quality Gates:** Vitest unit tests, Supertest integration tests, and Playwright end-to-end browser journeys.
- **DevOps & Containerization:** Multi-stage Dockerfiles, Docker Compose stack, GitHub Actions CI/CD pipeline, and k6 load testing scenarios.

---

## 2. Architecture & Design Documentation

| Documentation Resource | Path | Description |
|:---|:---|:---|
| **Requirement Traceability Matrix** | [`docs/requirement-traceability.md`](file:///Users/harshsharma/Desktop/PGY2/docs/requirement-traceability.md) | Maps all 27 non-negotiable requirements to files, tests, and evidence. |
| **System Architecture** | [`docs/architecture/system-architecture.md`](file:///Users/harshsharma/Desktop/PGY2/docs/architecture/system-architecture.md) | Layered backend, request lifecycle, topology diagrams, caching flows. |
| **Database Data Model** | [`docs/architecture/data-model.md`](file:///Users/harshsharma/Desktop/PGY2/docs/architecture/data-model.md) | Schemas, relations, compound indexes, and entity lifecycle specs. |
| **RBAC Specification** | [`docs/architecture/rbac-matrix.md`](file:///Users/harshsharma/Desktop/PGY2/docs/architecture/rbac-matrix.md) | Granular permission matrix across all platform operations and roles. |
| **Multi-Tenancy Strategy** | [`docs/architecture/multi-tenancy-strategy.md`](file:///Users/harshsharma/Desktop/PGY2/docs/architecture/multi-tenancy-strategy.md) | Tenant resolution, repository auto-scoping, and cross-tenant tests. |
| **REST API Specification** | [`docs/api/api-specification.md`](file:///Users/harshsharma/Desktop/PGY2/docs/api/api-specification.md) | Complete `/api/v1` endpoint catalog, payloads, responses, error codes. |
| **16-Week Roadmap** | [`docs/planning/16-week-roadmap.md`](file:///Users/harshsharma/Desktop/PGY2/docs/planning/16-week-roadmap.md) | Weekly development plan mapped to CA2 and CA3 checkpoints. |
| **Stitch UI Exploration Plan** | [`docs/planning/stitch-screen-plan.md`](file:///Users/harshsharma/Desktop/PGY2/docs/planning/stitch-screen-plan.md) | Screen state definitions across Public, Admin, Instructor, and Student. |
| **UI/UX Design System** | [`docs/planning/ui-ux-design-system.md`](file:///Users/harshsharma/Desktop/PGY2/docs/planning/ui-ux-design-system.md) | Plus Jakarta Sans typography, Cobalt tokens, and WCAG AA rules. |
| **Context7 Verification Registry** | [`docs/planning/context7-verification-registry.md`](file:///Users/harshsharma/Desktop/PGY2/docs/planning/context7-verification-registry.md) | Official documentation references, breaking changes, and verified APIs. |
| **Architecture Decision Records** | [`docs/adr/ADR-001-to-010.md`](file:///Users/harshsharma/Desktop/PGY2/docs/adr/ADR-001-to-010.md) | ADR-001 through ADR-010 documenting design rationale and tradeoffs. |

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Library:** Material UI (MUI v6) with Emotion
- **Routing:** React Router v6
- **Global State:** Redux Toolkit
- **Server Cache:** TanStack Query v5
- **Form Management:** React Hook Form + Zod
- **Real-Time Client:** Socket.IO Client
- **Charts & Telemetry:** Recharts
- **Icons:** Material UI Icons & Lucide React

### Backend
- **Runtime:** Node.js (v20+ / v22 LTS)
- **Framework:** Express.js with TypeScript
- **Database:** MongoDB 8.x with Mongoose ODM
- **Cache & Message Broker:** Redis 7.x / Valkey 9.x
- **Real-Time Gateway:** Socket.IO Server
- **Security & Crypto:** Argon2id, JSON Web Tokens (JWT), Helmet, CORS
- **Request Validation:** Zod
- **Logging:** Winston + Morgan HTTP logger

### Testing & Quality
- **Unit & Integration:** Vitest, Supertest
- **Component Testing:** React Testing Library, Jest-DOM
- **End-to-End Testing:** Playwright
- **Load & Performance Testing:** k6

### DevOps & Deployment
- **Containerization:** Docker & Docker Compose
- **Web Server / Reverse Proxy:** Nginx
- **CI/CD:** GitHub Actions

---

## 4. Repository Structure

```text
PGY2/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated Lint, Test, Build Pipeline
│       └── cd.yml                 # Staging / Container Deployment
├── backend/
│   ├── src/
│   │   ├── config/                # Environment, Database, Redis, OAuth configs
│   │   ├── controllers/           # HTTP Request Handlers
│   │   ├── middleware/            # Tenant, Auth, RBAC, Validation, Cache middlewares
│   │   ├── models/                # Mongoose Schema Definitions
│   │   ├── repositories/          # Tenant-Scoped Data Repositories
│   │   ├── routes/                # API Route Definitions (/api/v1)
│   │   ├── schemas/               # Zod Input Validation Schemas
│   │   ├── services/              # Pure Domain Business Logic
│   │   ├── sockets/               # Real-Time Socket.IO Handlers & Rooms
│   │   ├── types/                 # TypeScript Interface Definitions
│   │   ├── utils/                 # JWT, Crypto, Pagination, Response Helpers
│   │   ├── app.ts                 # Express Application Configuration
│   │   └── server.ts              # HTTP & WebSocket Server Entrypoint
│   ├── tests/
│   │   ├── unit/                  # Service & Utility Unit Tests
│   │   └── integration/           # Supertest API & Tenant Isolation Tests
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/                   # App Providers & Root Config
│   │   ├── components/            # Reusable UI Components (Tables, Modals, Forms)
│   │   ├── features/              # Feature Modules (Auth, Courses, Quizzes, Analytics)
│   │   ├── hooks/                 # Custom React Hooks
│   │   ├── layouts/               # Dashboard, Auth, Public Layout Shells
│   │   ├── routes/                # Route Declarations & Protected Guards
│   │   ├── services/              # API Client & Socket Connection Services
│   │   ├── store/                 # Redux Toolkit Slices & Typed Hooks
│   │   ├── theme/                 # MUI v6 Design System Tokens & Components
│   │   ├── types/                 # Shared TypeScript Type Definitions
│   │   └── main.tsx               # Client Entrypoint
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
├── docs/                          # Comprehensive Architecture, API & ADR Specs
├── scripts/
│   ├── load-testing/              # k6 Performance Scenarios
│   └── seed/                      # Multi-Tenant Realistic Seed Data Scripts
├── docker-compose.yml             # Local Multi-Service Development Stack
├── docker-compose.prod.yml        # Production Container Stack
└── README.md
```

---

## 5. Quick Start (Local Development)

### Prerequisites
- Node.js v20+ or v22 LTS
- MongoDB v7+ or v8+ (running on `localhost:27017`)
- Redis v7+ or Valkey v9+ (running on `localhost:6379`)

### Option A: Direct Local Execution

1. **Clone & Configure Environment:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   # Server boots at http://localhost:5000 (API: http://localhost:5000/api/v1)
   ```

3. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   # Vite development server runs at http://localhost:5173
   ```

### Option B: Docker Compose (One-Command Startup)

```bash
docker compose up --build
```
This automatically starts:
- Frontend Web App at `http://localhost:3000`
- Backend API at `http://localhost:5000`
- MongoDB at `localhost:27017`
- Redis at `localhost:6379`

---

## 6. Verification & Evaluation Gates

- **CA2 Evaluation Gate (Week 8):** Layered architecture, JWT authentication with refresh token rotation, tenant isolation middleware, core course models, and unit/integration test suite.
- **CA3 Evaluation Gate (Week 15–16):** Full LMS workflow (lessons, quizzes, assignments), real-time WebSockets, Redis caching benchmarks, Playwright E2E suite, k6 load testing report, and Dockerized production deployment.
