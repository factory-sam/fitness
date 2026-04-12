# Cleanup opportunities

Findings from knip and jscpd, collected on 2026-04-11.

---

## Dead code

- **`getProgrammeExercises`** in `src/lib/queries.ts` is exported but never imported. The programme page fetches exercise data directly via the Supabase client instead of calling this helper.

## Duplicate code

jscpd found **6 clones** across the codebase:

| Clone | Files | Description |
|---|---|---|
| Login / signup form structure | `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx` | Both pages share nearly identical form markup, validation, and error-display logic. |
| `ProgrammeExercise` interface | `src/components/programme/programme-day-card.tsx`, `src/components/workout/active-workout.tsx` | The same type definition appears in both files rather than being shared from a single source. |
| Set-done toggle patterns | `src/components/workout/active-workout.tsx` (multiple locations) | Similar patterns for marking sets complete are repeated within the same component. |

## Complexity hotspots

| File | Lines | Issue |
|---|---|---|
| `src/lib/queries.ts` | 487 | Exceeds the 400-line file size limit. Contains every Supabase query for the app — candidates for splitting by domain (workout, body, supplements, programme). |
| `src/components/workout/active-workout.tsx` | 419 | Exceeds the 400-line limit. Manages workout state, set logging, timer, and UI in a single client component. |

## Technical debt markers

No `TODO` or `FIXME` comments exist in the codebase. This is expected — the entire app was written in a single session and nothing was deferred.
