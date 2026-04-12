---
name: review-guidelines
description: Code review guidelines specific to the Vitruvian fitness tracker codebase. Injected into every Droid review run.
---

# Vitruvian review guidelines

When reviewing PRs for this repository, check for these project-specific issues in addition to standard bug detection:

## Supabase patterns
- All queries must go through `lib/queries.ts` — pages and API routes should not create Supabase clients directly
- Query results must use `data ?? []` — never assume non-null from Supabase
- New tables must have `user_id UUID` with FK to `auth.users` and RLS policy `auth.uid() = user_id`
- No service role key usage — all queries use the publishable key via the SSR client

## Component conventions
- Prefer Server Components — only use `"use client"` when the component needs browser APIs, state, or event handlers
- No `any` types — use `Record<string, unknown>` for dynamic shapes
- Components grouped by domain under `components/` (dashboard, workout, body, supplements, programme)
- Use the type scale utility classes (`.type-heading`, `.type-caption`, etc.) instead of arbitrary font sizes
- Use design tokens from `globals.css` `@theme` — no hardcoded colors

## Data flow
- Server Components read data via `lib/queries.ts` directly
- Client Components mutate data via API routes under `(app)/api/`
- API routes also call `lib/queries.ts` — no direct Supabase usage in route handlers

## Testing
- New query functions in `lib/queries.ts` should have corresponding tests in `lib/__tests__/queries.test.ts`
- Tests mock the Supabase client — do not make real database calls
