## MODIFIED Requirements

### Requirement: Login Endpoint
The login endpoint SHALL update to support source application identification and improved access control.

#### Scenario: Admin logging in from Admin App
- **Given** I am a user with role 'admin'
- **When** I send a POST request to `/auth/login` with `source: 'admin'`
- **Then** I should receive a 200 OK response with a token.

#### Scenario: Regular User logging in from Admin App
- **Given** I am a user with role 'regular'
- **When** I send a POST request to `/auth/login` with `source: 'admin'`
- **Then** I should receive a 403 Forbidden response.

#### Scenario: Regular User logging in from Client App
- **Given** I am a user with role 'regular'
- **When** I send a POST request to `/auth/login` with `source: 'client'`
- **Then** I should receive a 200 OK response with a token.

## ADDED Requirements

### Requirement: Source Validation
The system MUST enforce the presence of the source parameter in login requests.

#### Scenario: Login without source
- **Given** I send a POST request to `/auth/login` without `source`
- **When** the request is validated
- **Then** I should receive a 400 Bad Request response indicating `source` is required.

### Requirement: Error Codes
The login endpoint SHALL return standardized error codes in the response body to allow frontend localization.

#### Scenario: Invalid Credentials
- **Given** I attempt to login with incorrect password
- **Then** the response body should contain `code: "INVALID_CREDENTIALS"`.

#### Scenario: Access Denied
- **Given** a regular user attempts to login to 'admin' source
- **Then** the response body should contain `code: "ACCESS_DENIED"`.

### Requirement: API Documentation
The API documentation (Swagger/OpenAPI) MUST be updated to reflect the new `source` parameter and error codes.

#### Scenario: Swagger Update
- **Given** the Swagger UI is accessed
- **Then** the login endpoint should show the required `source` field and possible 403 response.

