# Backend Server Spec Delta

## ADDED Requirements

### Requirement: Projects CRUD API
The system SHALL implement CRUD endpoints for managing Projects.

#### Scenario: Create Project
Given an authenticated Manager or Admin
When they make a POST request to `/api/v1/projects` with valid project data
Then a new project is created
And a 201 Created response is returned with the project data

#### Scenario: List Projects
Given an authenticated Manager or Admin
When they make a GET request to `/api/v1/projects`
Then a list of projects is returned
And the list supports pagination and filtering

#### Scenario: Get Project Details
Given an authenticated Manager or Admin
When they make a GET request to `/api/v1/projects/:id`
Then the specific project details are returned

#### Scenario: Update Project
Given an authenticated Manager or Admin
When they make a PATCH request to `/api/v1/projects/:id` with valid update data
Then the project is updated
And the updated project data is returned

#### Scenario: Delete Project
Given an authenticated Manager or Admin
When they make a DELETE request to `/api/v1/projects/:id`
Then the project is soft-deleted (active=false)
And a 200 OK response is returned

