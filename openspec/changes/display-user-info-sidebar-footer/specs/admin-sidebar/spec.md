# admin-sidebar Specification Delta

## ADDED Requirements

### Requirement: Sidebar footer displays logged-in user's name and job title

The sidebar footer MUST display the current user's `full_name` as the title and `job_title` as the subtitle.

#### Scenario: User logs in and sees their info in sidebar
- **Given** a user with full_name "John Doe" and job_title "Software Engineer"
- **When** the user logs into the admin application
- **Then** the sidebar footer shows "John Doe" as the user name
- **And** the sidebar footer shows "Software Engineer" as the job title

#### Scenario: Login API returns job_title
- **Given** a user exists with job_title "Project Manager"
- **When** the user successfully authenticates via `/api/v1/auth/login`
- **Then** the response includes `user.job_title` with value "Project Manager"
