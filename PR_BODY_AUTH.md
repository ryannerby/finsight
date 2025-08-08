### Summary
Integrate Clerk authentication, centralize provider, and add SignUp page. Fix routing and adapter wiring for reliable redirects.

### Changes
- Centralize `ClerkProvider` in `client/src/App.tsx` with `routerPush`/`routerReplace`
- Configure `afterSignInUrl` and `afterSignUpUrl` to `/deals`
- Replace duplicate provider by wrapping app with `BrowserRouter` in `client/src/main.tsx`
- Add `client/src/pages/SignUp.tsx` and route at `/sign-up`
- Protect routes with `SignedIn`/`SignedOut` (redirect unauthorized to `/login`)
- Fix TypeScript types for router adapters; lint passes

### Why
- Removes duplicate providers causing inconsistent auth state
- Ensures correct post-auth redirects
- Aligns with Clerk v5 + React Router integration guidelines

### Test plan
- `/login` → sign in → redirected to `/deals`
- `/sign-up` → sign up → redirected to `/deals`
- Direct access to `/deals` and `/deals/:dealId` when signed in works
- Logout from `/deals` redirects to `/login`
- Hard refresh on a protected route preserves session

### Notes
- Ensure `VITE_CLERK_PUBLISHABLE_KEY` is set in client envs
- Add dev/prod URLs to Clerk Allowed Origins and Redirect URLs
