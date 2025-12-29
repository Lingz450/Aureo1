# Aureo — Change Log

This file summarizes the major refactor work to move Aureo to **Supabase-only real data** (no local-only auth/data paths).

## Completed

- **Removed local-only mode**
  - Deleted all code paths that supported non-Supabase sessions or local-only data.
  - Removed the empty `src/app/api/demo/*` route folder.
  - Removed the outdated `scripts/smoke-employer-routes.mjs` and its `package.json` script entry.

- **Auth/UI consistency**
  - `Navbar` now reads session state from the shared viewer hook and uses Supabase-only logout.
  - Fixed missing import in `Navbar` discovered during build.

- **Jobs (seeker)**
  - `/jobs` and `/jobs/[id]` are now Supabase-only.
  - Apply flow writes to `applications` and checks `jobs.is_active` and existing applications.

- **Employer routing**
  - `/employer` redirects to the Supabase-backed employer dashboard at `/dashboard/employer`.
  - `/employer/jobs/*` routes redirect to `/dashboard/employer/jobs/*`.
  - `/employer/applicants` and `/employer/applicants/[id]` are Supabase-backed and safe for empty states.
  - Remaining employer pages are safe placeholders (no fake data, no crashing).

- **Middleware protection**
  - `app/proxy.ts` now protects:
    - seeker area: `/app/*`
    - employer area: `/employer/*` and `/dashboard/employer/*`
    - admin area: `/admin/*`
  - Enforces role-based access using `user_metadata.role` (falls back to `profiles.role` if needed).

- **Developer utilities**
  - Added dev-only seed script: `npm run seed:dev` (requires `SUPABASE_SERVICE_ROLE_KEY`).

## Verified

- `npm run build` passes.
- Repo-wide grep for `demo` returns no matches.




