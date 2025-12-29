# Demo Mode Removal - Status

## Completed
- ✅ Deleted `app/src/lib/demo-mode.ts`
- ✅ Deleted `app/src/lib/demo-store.ts`
- ✅ Deleted `app/src/components/demo-auto-login.tsx`
- ✅ Deleted `app/src/app/app/demo-dashboard.tsx`
- ✅ Deleted `app/src/app/app/profile/demo-profile.tsx`
- ✅ Deleted `app/src/app/api/demo/login/route.ts`
- ✅ Deleted `app/src/app/api/demo/logout/route.ts`
- ✅ Deleted `app/src/lib/store/` directory (index.ts, types.ts, events.ts)
- ✅ Updated `app/src/lib/viewer.ts` - removed demo mode, Supabase only
- ✅ Updated `app/src/lib/logout.ts` - removed demo mode
- ✅ Updated `app/src/lib/use-viewer.ts` - removed demo mode
- ✅ Updated `app/proxy.ts` - removed demo mode, requires Supabase
- ✅ Updated `app/src/lib/auth-guard.tsx` - removed demo mode
- ✅ Updated `app/src/app/layout.tsx` - removed DemoAutoLogin
- ✅ Updated `app/src/app/auth/login/view.tsx` - removed demo mode
- ✅ Updated `app/src/app/auth/register/view.tsx` - removed demo mode
- ✅ Updated `app/src/app/auth/login/page.tsx` - removed demo mode
- ✅ Updated `app/src/app/auth/register/page.tsx` - removed demo mode
- ✅ Updated `app/src/components/navbar.tsx` - removed demo mode and store
- ✅ Updated `app/src/app/page.tsx` - removed demo mode and store
- ✅ Updated `app/src/app/app/page.tsx` - removed demo mode
- ✅ Updated `app/src/app/app/profile/page.tsx` - removed demo mode

## Remaining Work

### Files with `isDemoMode` import (need to remove import and conditional logic):
1. `app/src/lib/use-auth.ts` - Can be deprecated if useViewer is used everywhere
2. `app/src/app/alerts/page.tsx`
3. `app/src/app/app/saved-searches/new/page.tsx`
4. `app/src/app/app/inbox/page.tsx`
5. `app/src/app/app/saved-searches/page.tsx`
6. `app/src/app/app/saved/page.tsx`
7. `app/src/app/app/applications/page.tsx`
8. `app/src/components/save-job-cta-button.tsx`
9. `app/src/app/jobs/[id]/apply-flow-dialog.tsx`
10. `app/src/app/jobs/[id]/apply-button.tsx`
11. `app/src/app/jobs/page.tsx`
12. `app/src/app/jobs/[id]/page.tsx`
13. All employer pages (many files)
14. `app/src/components/application-drawer.tsx`

### Files with `@/lib/store` import (need to replace with Supabase queries):
1. `app/src/app/alerts/page.tsx`
2. `app/src/app/app/saved-searches/new/page.tsx`
3. `app/src/app/app/inbox/page.tsx`
4. `app/src/app/app/saved-searches/page.tsx`
5. `app/src/app/app/saved/page.tsx`
6. `app/src/app/app/applications/page.tsx`
7. `app/src/components/save-job-cta-button.tsx`
8. `app/src/app/jobs/[id]/apply-flow-dialog.tsx`
9. `app/src/app/jobs/[id]/apply-button.tsx`
10. `app/src/app/jobs/page.tsx`
11. `app/src/app/jobs/[id]/page.tsx`

## Next Steps
1. Remove all `isDemoMode()` imports and conditional logic
2. Replace all `useStoreSnapshot()` and store methods with Supabase queries
3. Update all pages to handle empty states properly
4. Create dev seed script
5. Final testing



