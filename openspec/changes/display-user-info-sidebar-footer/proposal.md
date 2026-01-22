# Proposal: Display User Info in Sidebar Footer

## Summary

Add `job_title` to the login response and auth state so the sidebar footer can display the current user's `full_name` and `job_title`.

## Current State

The sidebar component (`RightSidebarTaskbar.tsx`) already renders:
```tsx
<span className="user-name">{user.full_name}</span>
<span className="user-job-title">{user.job_title}</span>
```

However, `job_title` is **not included** in the login API response or the frontend auth state, causing `user.job_title` to be `undefined`.

## Root Cause

1. **Backend**: `authController.ts` login handler returns only `user_id`, `full_name`, `email`, `role` - missing `job_title`
2. **Frontend**: `authSlice.ts` User interface doesn't include `job_title` field

## Proposed Solution

1. Update backend `authController.ts` to include `job_title` in login response
2. Update frontend `authSlice.ts` User interface to include `job_title`
3. The sidebar already renders these fields - no changes needed there

## Scope

### In Scope
- Add `job_title` to login API response
- Add `job_title` to frontend User type in authSlice

### Out of Scope
- Sidebar component changes (already implemented)
- Styling changes

## Files to Modify

| File | Change |
|------|--------|
| `server/src/controllers/authController.ts` | Add `job_title` to user object in login response |
| `admin/src/store/slices/authSlice.ts` | Add `job_title` to User interface |
