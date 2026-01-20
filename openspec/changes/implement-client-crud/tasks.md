# Tasks

1. Create Validation Schema
   - File: `server/src/validations/clientValidation.ts`
   - Implement `createClientSchema`, `updateClientSchema`, `getClientSchema`, `listClientsSchema`.

2. Create Service
   - File: `server/src/services/clientsService.ts`
   - Implement `ClientsService` with methods: `createClient`, `listClients`, `getClientById`, `updateClient`, `deleteClient`.
   - Handle existing `ClientRepository` or use `SupabaseClient` directly (Plan to check if repo needed). Note: Existing code uses `UserRepository`, so likely need `ClientRepository` or direct usage. *Correction*: Will check if `ClientRepository` exists or needs creation. Given `UserRepository` exists, I should probably create `ClientRepository` or follow the pattern.

3. Create Controller
   - File: `server/src/controllers/clientsController.ts`
   - Implement handlers for CRUD operations.

4. Create Routes
   - File: `server/src/routes/clients.ts`
   - Define routes and add Swagger documentation.

5. Register Routes
   - File: `server/src/routes/index.ts`
   - Add `/clients` route.
