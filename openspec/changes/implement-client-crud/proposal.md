# Implement Client CRUD Operations

## Summary
Implement CRUD operations for clients in the server backend, enabling administrators to manage client organizations.

## Problem Statement
Currently, there is no API to manage clients. Administrators need to be able to create, read, update, and soft-delete clients to assign projects to them.

## Solution Strategy
- Implement a `ClientsService` following the pattern of `UsersService`.
- Implement `clientsController` and routes.
- Use Supabase for data persistence.
- Soft delete will toggle the `active` flag.
- Validation using Zod.
- Swagger documentation via JSDoc comments.
