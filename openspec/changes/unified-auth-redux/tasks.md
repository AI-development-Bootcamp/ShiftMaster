# Tasks

1. [ ] Update Backend Login Logic
    1. [x] Modify `loginSchema` in `server/src/controllers/authController.ts` to include `source` ('admin' | 'client').
    2. [x] Update `login` function to check `source` against user role.
    3. [x] Modify `server/src/routes/auth.ts` to update Swagger documentation with new parameter and error codes.
    4. [x] Add tests for `authController` to verify access control based on source.

2. [ ] Implement Redux Auth Slice (Shared/Admin/Client)
    1. [x] Create `authSlice.ts` in `admin/src/store/slices/`.
    2. [x] Create `authSlice.ts` in `client/src/store/slices/`.
    3. [x] Implement `loginUser` async thunk with `localStorage` persistence.
    4. [x] Add initialization logic to rehydrate state from `localStorage` on app load.

3. [ ] Integrate Login UI with Redux
    1. [x] Update `LoginWelcomeCard.tsx` in Admin to use `dispatch(loginUser({ email, password, source: 'admin' }))` on form submission.
    2. [x] Update Client Login page to use `dispatch(loginUser({ email, password, source: 'client' }))`.
    3. [x] Add error messages to translation dictionaries.
        1. [x] Update `admin/src/dictionary/en.ts` (mapped to `he.json`).
        2. [x] Update `client/src/dictionary/en.ts` (handled inline).
