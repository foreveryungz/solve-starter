# Review

## Summary

The core CRUD logic works as expected, but the API has several access-control and
data-safety gaps that need to be addressed, including SQL injection vulnerabilities,
weak password hashing, cross-user data leaks, and error handling that exposes internal details.

## Findings

### [BLOCKER] SQL injection across auth, registration, and note reads

- **What**: Queries are built using direct string interpolation from request input.
- **Why it matters**: This exposes the API to SQL injection attacks. An attacker can, for example, log in without a valid password by injecting SQL into the login request.
- **Fix**: Replaced string-interpolated queries with parameterized queries / prepared statements using placeholders.
- **Status**: Fixed.

### [BLOCKER] Insecure password hashing using MD5

- **What**: Passwords are hashed using MD5, an algorithm no longer considered safe for password storage due to its vulnerability to brute-force and rainbow table attacks.
- **Why it matters**: If the database were ever leaked, all user passwords could be cracked relatively easily.
- **Fix**: Replaced MD5 with bcrypt (automatic salting + adaptive cost), including re-hashing the seed data.
- **Status**: Fixed.

### [BLOCKER] Broken access control on GET /notes

- **What**: The endpoint returns notes from all users instead of only the notes belonging to the authenticated user.
- **Why it matters**: This is a basic privacy/confidentiality violation — any logged-in user can view other users' data.
- **Fix**: Notes are now filtered to only return those owned by the authenticated user.
- **Status**: Fixed.

### [BLOCKER] IDOR on GET /notes/:id

- **What**: A user can access another user's note simply by guessing or changing the `:id` in the URL.
- **Why it matters**: This is a classic Insecure Direct Object Reference (IDOR) — a high-severity issue since it requires no special effort to exploit.
- **Fix**: Added an ownership check before returning note data; returns 404 if the note does not belong to the requesting user.
- **Status**: Fixed.

### [SHOULD-FIX] Input validation

- **What**: Requests are not validated for data type, null values, or required fields (e.g. empty email/password, or a plain string in the email field).
- **Why it matters**: Invalid input is currently persisted directly into the database, and the API returns uninformative errors instead of clear feedback (e.g. "field required" or "input too long").
- **Suggested Fix**: Add validation for every input field, covering data type, format, length, and required/nullable constraints.
- **Status**: Partially fixed.

### [SHOULD-FIX] Inconsistent JSON response shape

- **What**: Response shapes are inconsistent across endpoints, with no standard structure for status code, message, or data.
- **Why it matters**: This makes the API harder to consume reliably and increases the risk of client-side bugs.
- **Suggested Fix**: Introduce a standard response format and apply it consistently across all endpoints.
- **Status**: Documented, not fixed.

### [SHOULD-FIX] No centralized error handling

- **What**: Errors are thrown directly without being caught, which can crash the server or leak stack traces to the client.
- **Why it matters**: This creates a risk of downtime from unhandled exceptions and exposes internal implementation details to users.
- **Fix**: Add a global Express error-handling middleware that returns a consistent error format.
- **Status**: Documented, not fixed.

### [NICE-TO-HAVE] Schema and type safety are weaker than they should be

- **What**: The schema has no foreign key enforcement or migrations, and the TypeScript config disables `strict` while the code relies heavily on `any`.
- **Why it matters**: This makes future regressions more likely and reduces the value of TypeScript as a safety net.
- **Fix**: Add migrations with foreign keys and constraints, then incrementally enable stricter typing, starting with request/auth payloads.
- **Status**: Documented, not fixed.

## Changes made

- **`auth.ts`** (login endpoint): converted to an async function, added input validation, added try/catch error handling, replaced raw queries with parameterized queries.
- **`db.ts`**: replaced password hashing with bcrypt, added a `verifyPassword` function for hash comparison, updated seed data logic to be async.
- **`users.ts`** (register endpoint): converted to an async function, added input validation, added try/catch error handling, replaced raw queries with parameterized queries.
- **`notes.ts`**: added try/catch error handling, added input validation, added ownership checks (`WHERE user_id = ?`) on `GET /notes` and `GET /notes/:id`.
- **`index.ts`**: refactored server bootstrap into an exported `createApp()` function, and guarded `app.listen()` with `require.main === module` so the app only starts listening when run directly (not when imported for testing).

## Test output

```
> notes-api@1.0.0 test
> vitest run

 RUN  v1.6.1 G:/project/backend-assessment-starter

stdout | tests/users.test.ts > users api > should return 409 when email is already registered
status: 409
body: { error: 'email taken' }

 ✓ tests/notes.test.ts (5) 3731ms
 ✓ tests/auth.test.ts (4) 2549ms
 ✓ tests/users.test.ts (7) 4038ms

 Test Files  3 passed (3)
      Tests  16 passed (16)
   Start at  14:49:52
   Duration  4.49s (transform 257ms, setup 1ms, collect 270ms, tests 10.32s, environment 1ms, prepare 425ms)

```

## What I'd do with more time

- Standardize the response format across all endpoints.
- Build a centralized validation layer/helper instead of validating inline per route.
- Add broader test coverage, including edge cases for input validation and error handling.

## Top 3 things before production

1. **Comprehensive automated test coverage, especially for authentication and access control**: these are the areas most prone to regressions, and the issues found here (IDOR, broken access control) are exactly the kind of bugs that automated tests are best at catching early.
2. **Centralized input validation and standardized error/response handling**: this is foundational infrastructure that affects every endpoint; without it, every new feature will inherit the same inconsistency and validation gaps.
3. **Logging and monitoring, particularly around authentication failures and suspicious access patterns**: without visibility into failed logins or repeated unauthorized access attempts, the team would have no way to detect an active attack in production.
