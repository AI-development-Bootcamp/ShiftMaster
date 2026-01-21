# Client Management Specs

## ADDED Requirements

### Requirement: Create Client
Admins MUST be able to create new client organizations with a name and optional contact info.
#### Scenario: Create a new client
- Given I am an authenticated admin user
- When I make a POST request to `/api/v1/clients` with:
  | Field | Value |
  |-------|-------|
  | name | "New Client" |
  | contact_info | "test@client.com" |
- Then the response status should be 201
- And the response body should contain the created client data with:
  | Field | Value |
  |-------|-------|
  | name | "New Client" |
  | active | true |

### Requirement: List Clients
Admins MUST be able to list all client organizations with pagination support.
#### Scenario: List clients with pagination
- Given I am an authenticated admin user
- And 5 clients exist
- When I make a GET request to `/api/v1/clients?limit=2&page=1`
- Then the response status should be 200
- And the response body should contain 2 clients
- And the pagination metadata should show total as 5

### Requirement: Get Client
Admins MUST be able to retrieve details of a specific client organization.
#### Scenario: Get single client details
- Given I am an authenticated admin user
- And a client with ID "123" exists
- When I make a GET request to `/api/v1/clients/123`
- Then the response status should be 200
- And the response body should contain the client details

### Requirement: Update Client
Admins MUST be able to update client organization details.
#### Scenario: Update client details
- Given I am an authenticated admin user
- And a client with ID "123" exists
- When I make a PATCH request to `/api/v1/clients/123` with:
  | Field | Value |
  |-------|-------|
  | name | "Updated Name" |
- Then the response status should be 200
- And the client name should be updated to "Updated Name"

### Requirement: Soft Delete Client
Admins MUST be able to soft-delete (deactivate) client organizations.
#### Scenario: Soft delete client
- Given I am an authenticated admin user
- And a client with ID "123" exists and is active
- When I make a DELETE request to `/api/v1/clients/123`
- Then the response status should be 200
- And the client should be marked as inactive (active=false)
