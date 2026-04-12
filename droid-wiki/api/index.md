# API routes

Vitruvian has 12 API route handlers under `(app)/api/`. They exist so Client Components can mutate and read data — Server Components read directly via [queries.ts](../systems/data-layer.md) without needing API routes.

All routes live inside the `(app)` route group, so they are protected by [authentication middleware](../systems/auth.md). The Supabase client used in these routes respects RLS, ensuring users can only access their own data.

## Route groups

| Group | Routes | Purpose |
|---|---|---|
| Sessions | 2 | Workout session CRUD |
| Stats | 1 | Dashboard aggregate data |
| Body composition | 1 | Weight, body fat tracking |
| Measurements | 1 | Body site measurements |
| Working weights | 1 | Latest weight per exercise |
| Supplements | 4 | Supplement management + compliance logging |
| Exercises | 1 | Exercise history + personal records |
| Programme | 1 | Training programme structure |

## Pattern

Most routes follow the same structure:

1. Import query functions from `lib/queries.ts`.
2. Parse request body (POST/PATCH) or query params (GET).
3. Call the query function.
4. Return `Response.json()` with the result.

Error handling is minimal — query functions throw on Supabase errors, which surface as 500s. The `programme` route is the only one that creates the Supabase client directly instead of using `queries.ts`.

See the [Route reference](./route-reference.md) for the complete list with methods, paths, and parameters.
