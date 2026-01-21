# Spec Delta: Admin Project Management

## ADDED Requirements

### Requirement: Admin Project Management
The Admin UI MUST enable full CRUD operations for projects, integrating with the backend API.

#### Scenario: Admin creates a project
Given I am an authenticated Admin
When I submit the Create Project form with valid details
Then a new project is created in the database
And I see the new project in the list

#### Scenario: Admin edits a project
Given I am an authenticated Admin
When I edit an existing project
Then the project details are updated in the database
And the list reflects the changes

#### Scenario: Admin deletes a project
Given I am an authenticated Admin
When I confirm deletion of a project
Then the project is removed from the system (soft delete)
And it disappears from the list

#### Scenario: Admin changes project report type
Given I am on the Entries Management page
When I change the "Report Type" radio for a project
Then the `time_format_type` is updated for that project
And the change is persisted
