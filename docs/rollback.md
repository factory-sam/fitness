# Rollback & Progressive Rollout

## Instant Rollback (Vercel)

Vercel keeps every deployment immutable. To roll back to the previous production
deployment:

```bash
# List recent deployments
npx vercel ls --prod

# Promote a previous deployment to production
npx vercel promote <deployment-url>
```

Or use the Vercel dashboard: **Project → Deployments → ⋯ → Promote to Production**.

Rollbacks take effect in < 10 seconds with zero downtime (immutable deployments,
edge network swap).

### When to roll back

- Error rate spike visible in PostHog or Vercel Analytics after deploy
- Critical console errors reported in production
- Auth or database connectivity failures after a code change

## Progressive Rollout via Feature Flags

All significant features should ship behind a PostHog feature flag so they can
be gradually rolled out without redeploying.

### Creating a rollout

1. **Define the flag** in `src/lib/feature-flags.ts` (add a key to `FLAGS`).
2. **Create the flag** in PostHog dashboard → Feature Flags → New.
3. **Set rollout percentage** — start at 10%, monitor, then increase:
   - 10% → monitor for 1 hour
   - 50% → monitor for 4 hours
   - 100% → full GA
4. **Use client-side**: `useClientFlag(FLAGS.MY_FEATURE)` in React components.
5. **Use server-side**: `await isFeatureEnabled(FLAGS.MY_FEATURE, userId)` in
   API routes or Server Components.

### Rolling back a feature

Set the flag rollout to 0% in PostHog. This instantly disables the feature for
all users without a code deploy.

### Flag lifecycle

1. **Ship behind flag** — merge code with flag gating.
2. **Gradual rollout** — increase percentage over hours/days.
3. **Full GA** — set to 100%.
4. **Remove flag** — delete flag checks from code, remove from `FLAGS` registry,
   archive in PostHog.
