# Testing

## Test framework

Vitruvian uses [Vitest](https://vitest.dev/) for unit testing. Configuration lives in `vitest.config.ts` at the project root.

## Running tests

```bash
pnpm test
```

This runs all test files matching the default Vitest pattern. Coverage thresholds are set at **50% statements** — the test run fails if coverage drops below this.

## Existing test suite

There are 15 unit tests in a single file:

```
src/lib/__tests__/queries.test.ts
```

These tests mock the Supabase client and verify the query functions exported from `src/lib/queries.ts`. The tests cover:

- **Session queries** — fetching workout sessions with filters.
- **Working weights deduplication** — ensuring the most recent weight per exercise is returned.
- **PR grouping** — personal record calculations grouped by exercise.
- **Exercise history flattening** — transforming nested set data into flat history records.
- **Supplement queries** — fetching active supplements and log entries.
- **Programme queries** — loading programme days and exercises.

## Writing new tests

Place test files next to the module they test using the `__tests__/` directory convention, or use the `.test.ts` / `.test.tsx` suffix. Mock the Supabase client rather than hitting a real database — see the existing tests for the mocking pattern.

## Integration and end-to-end tests

There are no integration or end-to-end tests yet. The project has no Playwright, Cypress, or similar browser testing setup.
