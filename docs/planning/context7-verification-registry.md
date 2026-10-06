# EduSphere — Context7 API Verification Registry

**Authority:** CONTEXT7 — Documentation Authority  
**Policy:** Never Hallucinate an API. Every critical dependency must have its exact signature, version constraints, and breaking changes verified against current official documentation.

---

## 1. Verified Libraries Registry

| Library | Verified Version | Context7 Identifier | Critical Breaking Change / API Gotcha Checked | Status |
|:---|:---:|:---|:---|:---:|
| **Mongoose** | `8.x` | `/automattic/mongoose` | Mongoose 8 enforces strict schema queries; `findOneAndUpdate` options `{ new: true, runValidators: true }`; hooks must not call `next()` if returning a Promise. | ✅ VERIFIED |
| **ioredis** | `5.4.x` | `/redis/ioredis` | Standalone connection `new Redis(url)`; uses promises natively; key expiry via `set(key, val, 'EX', seconds)`. | ✅ VERIFIED |
| **Express** | `4.21.x` | `/expressjs/express` | Error handler middleware **must** maintain 4-argument signature `(err, req, res, next)` to be recognized by Express; async route errors in Express 4 require `next(err)` or express-async-errors wrapper. | ✅ VERIFIED |
| **Material UI** | `6.x` | `/mui/material-ui` | MUI v6 uses `createTheme` from `@mui/material/styles`; responsive font sizes via `responsiveFontSizes(theme)`; CSS variable support via `CssVarsProvider`. | ✅ VERIFIED |
| **React Router** | `6.26.x` | `/remix-run/react-router` | Uses `<Routes>`, `<Route element={<Component />} />`; navigation via `useNavigate()`; nested layouts using `<Outlet />`. | ✅ VERIFIED |
| **Redux Toolkit** | `2.2.x` | `/reduxjs/redux-toolkit` | `configureStore({ reducer: { ... } })`; `createSlice` handles Immer mutability internally; typed hooks via `useDispatch.withTypes<AppDispatch>()`. | ✅ VERIFIED |
| **TanStack Query** | `5.x` | `/tanstack/query` | **Critical Breaking Change in v5:** `useQuery` now takes a single object argument `{ queryKey: [...], queryFn: ... }`; `cacheTime` was renamed to `gcTime`. | ✅ VERIFIED |
| **Socket.IO** | `4.8.x` | `/socketio/socket.io` | Server initialization with CORS; client auth passed via `io(url, { auth: { token } })`; accessed on server via `socket.handshake.auth.token`. | ✅ VERIFIED |
| **Zod** | `3.23.x` | `/colinhacks/zod` | Safe parsing via `schema.safeParse(data)`; typed inference via `z.infer<typeof schema>`. | ✅ VERIFIED |
| **Playwright** | `1.48.x` | `/microsoft/playwright` | Test runner uses `@playwright/test`; assertion library uses `expect(locator).toBeVisible()`; auto-waits on actions. | ✅ VERIFIED |

---

## 2. API Signature Safeguards

### TanStack Query v5 Syntax Verification
```typescript
// VERIFIED v5 SYNTAX (Object argument mandatory, gcTime instead of cacheTime)
const { data, isLoading, error } = useQuery({
  queryKey: ['courses', tenantId, page],
  queryFn: () => courseService.fetchCourses({ tenantId, page }),
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 30,    // 30 minutes garbage collection
});
```

### Express Async Error Handling Verification
```typescript
// VERIFIED: Centralized Error Handler (Strictly 4 arguments)
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
  });
};
```

### Socket.IO v4 Authentication Handshake Verification
```typescript
// VERIFIED: Server-side handshake extraction
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication token required'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    socket.data.user = payload;
    next();
  } catch (err) {
    next(new Error('Invalid or expired token'));
  }
});
```
