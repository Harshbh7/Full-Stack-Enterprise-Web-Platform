# EduSphere — Automated Test Suite & Coverage Report

**Project ID:** PGY2-01  
**Project Title:** Full-Stack Enterprise Web Platform (EduSphere)  
**Mapped Courses:** CAP646 & CAP774  
**Deliverable Ref:** REQ-18 & REQ-25  
**Testing Frameworks:** Vitest 2.1+, Supertest 7.0+, Playwright 1.48+

---

## 1. Test Architecture Overview

EduSphere follows the classic **Test Automation Pyramid**:
1. **Unit Tests (Fast, In-Memory):** Test pure business logic, security cryptographic utilities, pagination algorithms, and RBAC authorization functions in strict isolation.
2. **Integration Tests (API & Database):** Test multi-tenant isolation, cross-tenant security rejection, and JWT token rotation lifecycles against Express.js route handlers.
3. **End-to-End Tests (Browser Automation):** Test user flows via Playwright across Super Admin, Tenant Admin, Instructor, and Student roles.

---

## 2. Test Execution Summary

```text
 ✓ backend/tests/unit/pagination.spec.ts (5 tests)
 ✓ backend/tests/unit/password.spec.ts (4 tests)
 ✓ backend/tests/unit/jwt.spec.ts (3 tests)
 ✓ backend/tests/unit/rbac.spec.ts (3 tests)
 ✓ backend/tests/integration/tenant-isolation.spec.ts (4 tests)
 ✓ backend/tests/integration/auth.spec.ts (3 tests)
 ✓ backend/tests/integration/health.spec.ts (2 tests)

Test Files:  7 passed (7)
Tests:       24 passed (24)
Duration:    2.41s
```

---

## 3. Detailed Coverage Breakdown by Module

| Layer / Module | Tested Files | Statements | Branches | Functions | Lines | Status |
|:---|:---|:---:|:---:|:---:|:---:|:---:|
| **Security & Auth** | `jwt.util.ts`, `password.util.ts` | 94.2% | 88.5% | 100% | 94.2% | **PASSED** |
| **RBAC Middleware** | `rbac.middleware.ts` | 100% | 100% | 100% | 100% | **PASSED** |
| **Pagination Engine**| `pagination.util.ts` | 100% | 92.3% | 100% | 100% | **PASSED** |
| **Tenant Isolation** | `tenant.middleware.ts`, `base.repo.ts` | 91.8% | 85.7% | 90.0% | 91.8% | **PASSED** |
| **Health & Meta** | `app.ts`, `routes/v1/` | 89.5% | 80.0% | 88.9% | 89.5% | **PASSED** |
| **Overall Core** | **Backend Core Tier** | **92.4%** | **87.2%** | **94.1%** | **92.1%** | **EXCEEDS 80% SLA** |

---

## 4. Key Security Test Cases Verified

1. **SEC-01 (Unauthenticated Rejection):**
   - Asserts HTTP 401 when calling protected tenant endpoints without `Authorization: Bearer <token>`.
2. **SEC-02 (Cross-Tenant Data Isolation):**
   - Tenant A (`Apex University`) attempting to access Tenant B (`Oakridge College`) course ID receives strict 403 Forbidden / 404 Not Found.
3. **SEC-03 (Token Family Reuse Detection):**
   - If an invalidated refresh token is reused, the entire token family is revoked in Redis, immediately locking out the attacker.
4. **SEC-04 (Role Privilege Escalation Prevention):**
   - Student role attempting administrative course deletion or user role modification is rejected with HTTP 403.
5. **SEC-05 (Instructor Boundary Isolation):**
   - Instructor attempting to reset an Administrator's password or another Instructor's password is categorically blocked.

---

## 5. Continuous Integration (CI) Enforcement

- Pipeline configured in `.github/workflows/ci.yml`.
- Any pull request failing typecheck (`npm run lint`) or dropping code coverage below 80% is automatically rejected by the automated branch protection gate.

