# Authentication

Active contributors: Sam

Vitruvian uses Supabase Auth with email/password credentials. There is no OAuth, magic link, or social login — a single sign-in method keeps the auth surface minimal.

## How it works

### Middleware gate

Every incoming request passes through Next.js middleware (`src/middleware.ts`), which delegates to `updateSession()` in `utils/supabase/middleware.ts`. The middleware:

1. Creates a Supabase server client using the request cookies.
2. Calls `supabase.auth.getUser()` to check the session.
3. If the user is **not authenticated** and the path is not an auth route (`/login`, `/signup`, `/auth`), redirects to `/login`.
4. If the user **is authenticated** and tries to access an auth page, redirects to `/` (dashboard).

The matcher pattern excludes static assets (`_next/static`, images, favicon) from middleware processing.

### Route group separation

| Route group | Purpose | Auth required |
|---|---|---|
| `(auth)/` | Login, signup, auth callback | No |
| `(app)/` | All application pages and API routes | Yes |

The `(auth)` group contains standalone pages with no app chrome (no sidebar or status bar). The `(app)` group wraps everything in the authenticated layout with navigation.

### Login flow

1. User submits email/password on `/login` (Client Component using `createClient()` from `utils/supabase/client.ts`).
2. `supabase.auth.signInWithPassword()` authenticates against Supabase.
3. On success, `router.push("/")` and `router.refresh()` redirect to the dashboard.

### Signup flow

1. User submits email/password on `/signup`.
2. `supabase.auth.signUp()` sends a confirmation email with a redirect URL pointing to `/auth/callback`.
3. The callback route (`(auth)/auth/callback/route.ts`) exchanges the `code` query param for a session via `supabase.auth.exchangeCodeForSession()`.
4. On success, redirects to `/`. On failure, redirects to `/login?error=auth`.

### Database-level security

- **RLS enabled on every table.** Policy: `auth.uid() = user_id`.
- **`BEFORE INSERT` triggers** auto-populate the `user_id` column on every insert, so application code never sets it manually.
- **No service role key** is used anywhere in the app. All Supabase clients use the publishable key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`), meaning the app can never bypass RLS.

### Supabase client variants

| Client | File | Used by |
|---|---|---|
| Server | `utils/supabase/server.ts` | Server Components, API routes (via `queries.ts`) |
| Browser | `utils/supabase/client.ts` | Client Components (login, signup, supplement logger) |
| Middleware | `utils/supabase/middleware.ts` | Next.js middleware (session refresh) |

All three use `@supabase/ssr` with cookie-based session management. The middleware client handles cookie refresh to keep sessions alive across requests.

## Key source files

| File | Purpose |
|---|---|
| `src/middleware.ts` | Entry point — delegates to `updateSession()` |
| `src/utils/supabase/middleware.ts` | Session check, redirect logic, cookie refresh |
| `src/utils/supabase/server.ts` | Server-side Supabase client factory |
| `src/utils/supabase/client.ts` | Browser-side Supabase client factory |
| `src/app/(auth)/login/page.tsx` | Login form (Client Component) |
| `src/app/(auth)/signup/page.tsx` | Signup form (Client Component) |
| `src/app/(auth)/auth/callback/route.ts` | OAuth/email callback handler |
