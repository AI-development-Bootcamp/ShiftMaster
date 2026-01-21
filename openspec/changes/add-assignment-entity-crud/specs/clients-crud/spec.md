# Clients CRUD Spec Delta

## ADDED Requirements

### Requirement: Create Client API
The system SHALL allow admin users to create new clients via POST /api/v1/clients.

#### Scenario: Successfully create a client
- **Given**: An authenticated admin user
- **When**: POST /api/v1/clients with `{ "name": "Acme Corp", "contact_info": "contact@acme.com" }`
- **Then**: Response status is 201
- **And**: Response includes the created client with generated `client_id`

#### Scenario: Create client without required name
- **Given**: An authenticated admin user
- **When**: POST /api/v1/clients with `{ }`
- **Then**: Response status is 400
- **And**: Response includes validation error for missing name

#### Scenario: Non-admin cannot create client
- **Given**: An authenticated regular user
- **When**: POST /api/v1/clients with valid payload
- **Then**: Response status is 403

---

### Requirement: Update Client API
The system SHALL allow admin users to update existing clients via PATCH /api/v1/clients/:id.

#### Scenario: Successfully update a client
- **Given**: An authenticated admin user and existing client with id "abc-123"
- **When**: PATCH /api/v1/clients/abc-123 with `{ "name": "Acme Corporation" }`
- **Then**: Response status is 200
- **And**: Response includes updated client data

#### Scenario: Update non-existent client
- **Given**: An authenticated admin user
- **When**: PATCH /api/v1/clients/non-existent-id with valid payload
- **Then**: Response status is 404
- **And**: Response error code is CLIENT_NOT_FOUND

---

### Requirement: Delete Client API (Soft Delete with Cascade)
The system SHALL allow admin users to soft-delete clients via DELETE /api/v1/clients/:id. Related projects and their tasks MUST also be soft-deleted.

#### Scenario: Successfully soft-delete a client
- **Given**: An authenticated admin user and existing active client with id "abc-123"
- **And**: Client has 2 related projects with 3 tasks total
- **When**: DELETE /api/v1/clients/abc-123
- **Then**: Response status is 200
- **And**: Client active flag is set to false
- **And**: All related projects have active=false
- **And**: All related tasks have active=false

#### Scenario: Delete client returns success message
- **Given**: An authenticated admin user and existing client
- **When**: DELETE /api/v1/clients/:id
- **Then**: Response includes `{ "success": true, "message": "..." }`

---

## Cross-References
- See `projects-crud` for project cascade delete behavior
- See `tasks-crud` for task management
