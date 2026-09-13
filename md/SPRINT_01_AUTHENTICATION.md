# JetSwap Sprint 1 — Real Authentication

## AI AGENT TASK

Implement Sprint 1 only.

Do not implement products, JetMatch, offers, messaging, admin, or unrelated features during this task.

Read first:

```text
AGENTS.md
JETSWAP_IMPLEMENTATION_PLAN.md
prisma/schema.prisma
src/lib/auth.ts
src/lib/prisma.ts
src/app/api/auth
src/app/login
src/app/register
```

---

# OBJECTIVE

Replace JetSwap's mock authentication with real PostgreSQL-backed authentication using the existing:

```text
NextAuth
Prisma
PostgreSQL
bcryptjs
```

stack.

The current code contains mock behavior.

Remove that mock behavior safely.

---

# STEP 1 — BASELINE

Before modifications run:

```bash
npm install
npm run lint
npm run build
npx prisma validate
npx prisma generate
```

Record any existing errors.

Do not attribute pre-existing errors to your modifications.

---

# STEP 2 — INSPECT USER MODEL

Review `User` in:

```text
prisma/schema.prisma
```

Confirm at minimum:

```text
id
email
password
name
role
createdAt
updatedAt
```

are usable.

Do not unnecessarily redesign the user schema.

---

# STEP 3 — REGISTRATION API

Update:

```text
src/app/api/auth/register/route.ts
```

The endpoint must:

1. Parse request JSON.
2. Normalize email:

```text
trim
lowercase
```

3. Validate required fields.
4. Require reasonable password length.
5. Check whether email already exists.
6. Hash password using `bcryptjs`.
7. Create user using Prisma.
8. Return only safe user data.

Example safe output:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "email": "..."
  }
}
```

Never return:

```text
password hash
```

---

# STEP 4 — ERROR HANDLING

Expected cases:

### Missing input

HTTP:

```text
400
```

### Invalid email

HTTP:

```text
400
```

### Duplicate email

HTTP:

```text
409
```

### Unexpected database/server issue

HTTP:

```text
500
```

Do not expose internal Prisma error details to the client.

---

# STEP 5 — REAL LOGIN

Update:

```text
src/lib/auth.ts
```

Remove:

```text
mockUser
```

Remove TODO behavior that accepts arbitrary credentials.

Authorization flow:

```text
credentials
↓
normalize email
↓
Prisma user.findUnique()
↓
ensure password hash exists
↓
bcrypt.compare()
↓
return safe user
```

If authentication fails:

```text
return null
```

Do not reveal whether email or password was wrong.

---

# STEP 6 — SESSION CONTENT

Update callbacks so session user includes:

```text
id
email
name
role
```

Add/adjust TypeScript types cleanly.

Do not use uncontrolled `any` unless unavoidable.

If necessary create:

```text
src/types/next-auth.d.ts
```

---

# STEP 7 — SERVER AUTH HELPER

Create reusable helper.

Suggested:

```text
src/lib/require-user.ts
```

or equivalent consistent location.

Purpose:

```text
get authenticated session
validate session
return user identity
```

It will be reused in later product APIs.

Avoid duplicating session-check logic in every route.

---

# STEP 8 — REGISTER FRONTEND

Inspect:

```text
src/app/register/page.tsx
```

Ensure it handles:

```text
success
validation errors
duplicate email
server errors
loading state
```

After successful registration:

Preferred UX:

```text
redirect to /login
```

unless automatic login already exists and is cleanly implemented.

Do not add unnecessary onboarding yet.

---

# STEP 9 — LOGIN FRONTEND

Inspect:

```text
src/app/login/page.tsx
```

Ensure:

```text
real credentials
loading state
invalid credential error
successful redirect
```

work.

Do not display raw NextAuth/internal errors.

---

# STEP 10 — PASSWORD SECURITY

Use:

```text
bcryptjs
```

Recommended hash rounds:

```text
10–12
```

Do not invent custom cryptography.

Do not store passwords in:

```text
logs
localStorage
sessionStorage
cookies
```

---

# STEP 11 — TEST CASES

Manually or automatically verify:

## Registration

### Test A

New valid user.

Expected:

```text
201
user exists in DB
password stored as bcrypt hash
```

### Test B

Duplicate email.

Expected:

```text
409
```

### Test C

Bad password.

Expected:

```text
400
```

### Test D

Missing fields.

Expected:

```text
400
```

---

## Login

### Test E

Correct email/password.

Expected:

```text
successful session
real user ID
```

### Test F

Wrong password.

Expected:

```text
failed login
```

### Test G

Unknown email.

Expected:

```text
failed login
```

Error presented to the user should remain generic.

---

# STEP 12 — BUILD CHECK

Run:

```bash
npm run lint
npm run build
npx prisma validate
npx prisma generate
```

All new errors introduced by this sprint must be fixed.

---

# STEP 13 — DO NOT DO

During this sprint DO NOT:

```text
create JetMatch
change Product models
implement ProductWant
implement offers
implement messages
implement admin dashboard
change branding
redesign homepage
add Google login
add Apple login
add phone OTP
add identity verification
add payments
```

Those belong to later tasks.

---

# STEP 14 — FINAL REPORT

When finished, output a short report containing:

## Completed

What changed.

## Modified Files

List files.

## Database Changes

List schema/migration changes, if any.

## Environment Variables

List new required variables, if any.

## Tests

What was executed.

## Remaining Issues

Anything unresolved.

Do not start Sprint 2 automatically.

Wait for the next explicit task.