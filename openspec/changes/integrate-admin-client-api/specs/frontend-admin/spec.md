## ADDED Requirements

### Requirement: Client API Integration

The admin application SHALL use the server's `/api/v1/clients` endpoints for all client management operations instead of static mock data.

#### Scenario: Fetching client list

- **WHEN** the AssignmentPage or EntriesManagementPage loads
- **THEN** the system SHALL call GET `/api/v1/clients` to retrieve the client list
- **AND** display the returned clients in the UI

#### Scenario: Creating a new client

- **WHEN** the user submits the "Create Client" form with a client name
- **THEN** the system SHALL call POST `/api/v1/clients` with `{ name, contact_info }`
- **AND** refresh the client list on success
- **AND** display an error message on failure

#### Scenario: Editing an existing client

- **WHEN** the user submits the "Edit Client" form with modified fields
- **THEN** the system SHALL call PATCH `/api/v1/clients/:id` with the changed fields
- **AND** refresh the client list on success
- **AND** display an error message on failure

#### Scenario: Deleting a client

- **WHEN** the user confirms client deletion in the confirmation modal
- **THEN** the system SHALL call DELETE `/api/v1/clients/:id`
- **AND** refresh the client list on success
- **AND** display an error message on failure

### Requirement: Authentication Token Handling

The admin application SHALL use the JWT token stored in `localStorage` (key: `auth_token`) for all authenticated API requests.

#### Scenario: Token present

- **WHEN** a client API request is made
- **AND** `auth_token` exists in localStorage
- **THEN** the request SHALL include the `Authorization: Bearer <token>` header

#### Scenario: Token missing

- **WHEN** a client API request is made
- **AND** `auth_token` does not exist in localStorage
- **THEN** the server SHALL return a 401 Unauthorized error
- **AND** the UI SHALL display an appropriate error message
