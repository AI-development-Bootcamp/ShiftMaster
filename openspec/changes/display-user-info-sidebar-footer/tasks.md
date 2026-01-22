# Tasks: Display User Info in Sidebar Footer

## 1. Backend - Add job_title to Login Response

- [x] 1.1 Update `authService.ts` to include `job_title` in UserFromDB, AuthenticatedUser interfaces and select query
- [x] 1.2 Update `authController.ts` login handler to include `job_title` in user response object

## 2. Frontend - Update Auth State Type

- [x] 2.1 Add `job_title: string` to User interface in `authSlice.ts`

## 3. Verification

- [x] 3.1 Run server tests (`npm test -w server`) - 239 tests passing
- [x] 3.2 Run linting - No errors
- [ ] 3.3 Manual test: Login and verify sidebar shows full_name and job_title
