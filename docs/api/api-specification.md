# EduSphere — REST API Specification v1

**Base URL:** `/api/v1`  
**Protocol:** HTTPS  
**Content-Type:** `application/json`  
**Authentication:** `Authorization: Bearer <accessToken>`  
**Tenant Context Header (Optional/Override):** `X-Tenant-ID: <tenantId_or_slug>`

---

## 1. Standard Response Formats

### 1.1 Success Response Envelope
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 1.2 Error Response Envelope
```json
{
  "success": false,
  "message": "Validation failed on submitted fields",
  "code": "VALIDATION_ERROR",
  "errors": [
    { "field": "email", "message": "Invalid email address format" }
  ],
  "timestamp": "2026-10-06T12:00:00.000Z"
}
```

---

## 2. API Endpoints Map

### 2.1 Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
|:---|:---|:---|:---:|:---|
| `POST` | `/auth/register` | Register new user in tenant | ❌ (Public) | Anyone |
| `POST` | `/auth/login` | Authenticate email/password | ❌ (Public) | Anyone |
| `POST` | `/auth/refresh` | Rotate refresh token & get new access token | ❌ (Cookie) | Anyone with valid cookie |
| `POST` | `/auth/logout` | Revoke active refresh token session | ✅ | Any authenticated |
| `GET` | `/auth/me` | Fetch active user profile & tenant info | ✅ | Any authenticated |
| `POST` | `/auth/forgot-password` | Request password reset email | ❌ | Anyone |
| `POST` | `/auth/reset-password` | Execute password reset via token | ❌ | Anyone |
| `GET` | `/auth/google` | Initiate OAuth2 Google login flow | ❌ | Anyone |
| `GET` | `/auth/google/callback`| OAuth2 callback & JWT exchange | ❌ | Anyone |

---

### 2.2 Tenants (`/api/v1/tenants`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
|:---|:---|:---|:---:|:---|
| `GET` | `/tenants` | List all platform tenants | ✅ | SUPER_ADMIN |
| `POST` | `/tenants` | Create new tenant organization | ✅ | SUPER_ADMIN |
| `GET` | `/tenants/:id` | Get tenant details & quotas | ✅ | SUPER_ADMIN, TENANT_ADMIN |
| `PUT` | `/tenants/:id` | Update tenant details/branding | ✅ | SUPER_ADMIN, TENANT_ADMIN |
| `PATCH`| `/tenants/:id/status`| Suspend or activate tenant | ✅ | SUPER_ADMIN |
| `GET` | `/tenants/lookup/:slug`| Public lookup of tenant branding by slug | ❌ | Anyone |

---

### 2.3 Users & Roster (`/api/v1/users`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
|:---|:---|:---|:---:|:---|
| `GET` | `/users` | Paginated tenant user list | ✅ | SUPER_ADMIN, TENANT_ADMIN |
| `POST` | `/users` | Create user (Student/Instructor) | ✅ | SUPER_ADMIN, TENANT_ADMIN |
| `GET` | `/users/:id` | Get user profile details | ✅ | Admins or Self |
| `PUT` | `/users/:id` | Update profile details | ✅ | Admins or Self |
| `PATCH`| `/users/:id/role` | Change user role | ✅ | SUPER_ADMIN, TENANT_ADMIN |
| `DELETE`| `/users/:id` | Deactivate/remove user | ✅ | SUPER_ADMIN, TENANT_ADMIN |

---

### 2.4 Courses (`/api/v1/courses`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
|:---|:---|:---|:---:|:---|
| `GET` | `/courses` | Search & paginated course catalog | ✅ | Any tenant user |
| `POST` | `/courses` | Create new course draft | ✅ | TENANT_ADMIN, INSTRUCTOR |
| `GET` | `/courses/:id` | Course details & syllabus outline | ✅ | Any tenant user |
| `PUT` | `/courses/:id` | Update course metadata | ✅ | Course Instructor, Admin |
| `PATCH`| `/courses/:id/publish`| Publish / unpublish course | ✅ | Course Instructor, Admin |
| `DELETE`| `/courses/:id` | Archive / soft delete course | ✅ | Course Instructor, Admin |
| `GET` | `/courses/popular` | Popular courses (Redis cached) | ✅ | Any tenant user |

---

### 2.5 Curriculum: Modules & Lessons (`/api/v1/courses/:courseId`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
|:---|:---|:---|:---:|:---|
| `POST` | `/courses/:courseId/modules` | Add module to course | ✅ | Course Instructor, Admin |
| `PUT` | `/courses/:courseId/modules/:id` | Update module title/order | ✅ | Course Instructor, Admin |
| `DELETE`| `/courses/:courseId/modules/:id` | Remove module | ✅ | Course Instructor, Admin |
| `POST` | `/courses/:courseId/modules/:moduleId/lessons` | Add lesson to module | ✅ | Course Instructor, Admin |
| `GET` | `/courses/:courseId/lessons/:id` | Fetch full lesson content | ✅ | Enrolled Students, Instructor |
| `PUT` | `/courses/:courseId/lessons/:id` | Update lesson content | ✅ | Course Instructor, Admin |
| `POST` | `/lessons/:id/progress` | Mark lesson complete / update watch time | ✅ | Enrolled Student |

---

### 2.6 Enrollments (`/api/v1/enrollments`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
|:---|:---|:---|:---:|:---|
| `GET` | `/enrollments` | List user enrollments | ✅ | Any authenticated |
| `POST` | `/courses/:courseId/enroll` | Student self-enrollment | ✅ | STUDENT |
| `GET` | `/courses/:courseId/roster` | List enrolled students | ✅ | Course Instructor, Admin |
| `GET` | `/enrollments/:courseId/progress` | Get student progress report | ✅ | Student (Self), Instructor |

---

### 2.7 Quizzes & Assessments (`/api/v1/quizzes`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
|:---|:---|:---|:---:|:---|
| `GET` | `/courses/:courseId/quizzes` | List quizzes for course | ✅ | Enrolled Students, Instructor |
| `POST` | `/courses/:courseId/quizzes` | Create new quiz | ✅ | Course Instructor, Admin |
| `GET` | `/quizzes/:id` | Get quiz with questions | ✅ | Enrolled Students, Instructor |
| `POST` | `/quizzes/:id/questions` | Add question to quiz | ✅ | Course Instructor, Admin |
| `POST` | `/quizzes/:id/attempts` | Start new quiz attempt | ✅ | Enrolled Student |
| `POST` | `/quizzes/:id/submit` | Submit answers & auto-grade | ✅ | Enrolled Student |
| `GET` | `/quizzes/:id/results/:attemptId` | Review attempt score & answers | ✅ | Student (Self), Instructor |

---

### 2.8 Assignments & Submissions (`/api/v1/assignments`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
|:---|:---|:---|:---:|:---|
| `GET` | `/courses/:courseId/assignments` | List assignments | ✅ | Enrolled Students, Instructor |
| `POST` | `/courses/:courseId/assignments` | Create assignment | ✅ | Course Instructor, Admin |
| `POST` | `/assignments/:id/submit` | Submit student assignment | ✅ | Enrolled Student |
| `GET` | `/assignments/:id/submissions` | List submitted student works | ✅ | Course Instructor, Admin |
| `POST` | `/submissions/:id/grade` | Grade submission & provide feedback | ✅ | Course Instructor, Admin |

---

### 2.9 Announcements & Notifications (`/api/v1/announcements` & `/notifications`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
|:---|:---|:---|:---:|:---|
| `GET` | `/announcements` | List tenant / course announcements | ✅ | Any tenant user |
| `POST` | `/announcements` | Publish announcement (emits socket) | ✅ | TENANT_ADMIN, INSTRUCTOR |
| `GET` | `/notifications` | List user personal notifications | ✅ | Any authenticated |
| `PATCH`| `/notifications/:id/read` | Mark notification as read | ✅ | Recipient |
| `PATCH`| `/notifications/read-all` | Mark all notifications read | ✅ | Recipient |

---

### 2.10 Analytics & Dashboards (`/api/v1/analytics`)
| Method | Endpoint | Description | Auth Required | Roles Permitted |
|:---|:---|:---|:---:|:---|
| `GET` | `/analytics/super-admin` | Platform wide counts & growth | ✅ | SUPER_ADMIN |
| `GET` | `/analytics/tenant` | Tenant admin stats (Redis cached) | ✅ | TENANT_ADMIN |
| `GET` | `/analytics/instructor` | Instructor active courses & scores | ✅ | INSTRUCTOR |
| `GET` | `/analytics/student` | Student course progress & completion | ✅ | STUDENT |
