# Debugging

## Logging

There is no structured logging framework. The application uses `console` output only. Check the terminal running `pnpm dev` for server-side logs and the browser developer console for client-side output.

## Common issues

### Supabase connection failures

If queries return empty results or the app shows connection errors, check your `.env.local` file. It must contain valid values for both variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

See [Configuration](../reference/configuration.md) for the full list of environment variables.

### RLS policy blocking queries

All tables use Row Level Security with the policy `auth.uid() = user_id`. If queries return no rows when you expect data:

1. Confirm the user is authenticated (check the Supabase auth session in browser dev tools).
2. Verify the `user_id` column on the rows matches `auth.uid()` for the logged-in user.
3. Check that `BEFORE INSERT` triggers are present — they auto-populate `user_id` on new rows.

See [Data models](../reference/data-models.md) for table schemas and RLS details.

### Middleware redirect loops

The middleware at `src/middleware.ts` redirects unauthenticated users to `/login`. If you see an infinite redirect:

1. Check that the Supabase auth callback route at `(auth)/auth/callback` is working.
2. Clear browser cookies and try logging in again.
3. Verify the Supabase URL and publishable key are correct in `.env.local`.

### Next.js dev server

The dev server runs at `http://localhost:3000`. If the port is occupied, Next.js will suggest an alternative. If the server fails to start, check for TypeScript compilation errors in the terminal output.
