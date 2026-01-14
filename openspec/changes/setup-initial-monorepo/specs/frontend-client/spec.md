# Frontend Client

## ADDED Requirements

### Requirement: Mobile PWA Application
The client application SHALL be a mobile-first Progressive Web App built with React, Vite, and TypeScript.

#### Scenario: Application initialization
- **WHEN** the client app is started
- **THEN** it runs on port 5173 and renders without errors

#### Scenario: Mobile-first responsive design
- **WHEN** viewing the application on different screen sizes
- **THEN** the layout adapts appropriately starting from mobile

### Requirement: React and Vite Setup
The client SHALL use Vite as the build tool with React and TypeScript.

#### Scenario: Development server
- **WHEN** running npm run dev in /client
- **THEN** Vite starts the development server with hot module replacement

#### Scenario: Production build
- **WHEN** running npm run build in /client
- **THEN** Vite creates an optimized production bundle

### Requirement: Redux State Management
The client SHALL use Redux Toolkit for state management with a store independent from the admin application.

#### Scenario: Store initialization
- **WHEN** the client app starts
- **THEN** the Redux store is created and available to all components

#### Scenario: Store independence
- **WHEN** examining the client Redux store
- **THEN** it has no shared state with the admin application

### Requirement: Directory Structure
The client SHALL organize code into components, pages, store, styles, and utils directories.

#### Scenario: Standard structure
- **WHEN** viewing /client/src
- **THEN** components/, pages/, store/, styles/, and utils/ directories exist

### Requirement: Routing Setup
The client SHALL use React Router for navigation.

#### Scenario: Router configuration
- **WHEN** the app initializes
- **THEN** React Router is configured and ready for route definitions

### Requirement: Styling with Plain CSS
The client SHALL use plain CSS files for styling with a mobile-first approach.

#### Scenario: CSS reset
- **WHEN** the app loads
- **THEN** a CSS reset is applied for consistent cross-browser styling

#### Scenario: Mobile-first styles
- **WHEN** writing new styles
- **THEN** they use mobile-first media queries

### Requirement: Testing Configuration
The client SHALL use Vitest for unit and integration testing.

#### Scenario: Test execution
- **WHEN** running npm test in /client
- **THEN** Vitest executes all test files

#### Scenario: Test file convention
- **WHEN** creating new tests
- **THEN** they follow the *.test.ts or *.test.tsx naming pattern

### Requirement: Environment Variables
The client SHALL load the VITE_API_URL environment variable for backend API communication.

#### Scenario: API URL configuration
- **WHEN** the client makes API requests
- **THEN** it uses the URL from VITE_API_URL environment variable
